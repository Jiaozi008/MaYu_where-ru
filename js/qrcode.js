// js/qrcode.js
// 纯原生 JavaScript 标准二维码 (QR Code) 矩阵生成器
// 支持 8-bit Byte 模式 (URL / 文本)，全自动 Version 1-10 算力扩容

export const QRCode = {
  generateMatrix(text) {
    const qr = QRCodeImpl(text);
    return qr.modules;
  },

  drawToCanvas(canvasCtx, text, x, y, size) {
    try {
      const modules = this.generateMatrix(text);
      const count = modules.length;
      const cellSize = size / count;

      // 1. 绘制白底 Quiet Zone 边框 (防止周围暗色干扰扫描)
      canvasCtx.fillStyle = '#ffffff';
      canvasCtx.fillRect(x - 12, y - 12, size + 24, size + 24);

      // 2. 绘制黑色二维码模块
      canvasCtx.fillStyle = '#000000';
      for (let r = 0; r < count; r++) {
        for (let c = 0; c < count; c++) {
          if (modules[r][c]) {
            canvasCtx.fillRect(
              Math.floor(x + c * cellSize),
              Math.floor(y + r * cellSize),
              Math.ceil(cellSize),
              Math.ceil(cellSize)
            );
          }
        }
      }
    } catch (e) {
      console.error('QR Code render failed:', e);
      // 备用兜底画板
      canvasCtx.fillStyle = '#ffffff';
      canvasCtx.fillRect(x - 12, y - 12, size + 24, size + 24);
      canvasCtx.fillStyle = '#000000';
      canvasCtx.font = '14px sans-serif';
      canvasCtx.textAlign = 'center';
      canvasCtx.fillText('扫码进入牌局', x + size / 2, y + size / 2);
    }
  }
};

function QRCodeImpl(dataText) {
  let model = {};
  model.errorCorrectLevel = 1; // 1 = Level L (最大容量/最高容错)
  model.modules = null;
  model.moduleCount = 0;
  model.dataCache = null;
  model.dataList = [new QR8bitByte(dataText)];

  // 根据数据长度动态判定 Version (1-10)
  const byteLen = encodeURIComponent(dataText).replace(/%[89AB][0-9A-F]/gi, '^').length;
  if (byteLen <= 17) model.typeNumber = 1;
  else if (byteLen <= 32) model.typeNumber = 2;
  else if (byteLen <= 53) model.typeNumber = 3;
  else if (byteLen <= 78) model.typeNumber = 4;
  else if (byteLen <= 106) model.typeNumber = 5;
  else if (byteLen <= 134) model.typeNumber = 6;
  else if (byteLen <= 154) model.typeNumber = 7;
  else if (byteLen <= 192) model.typeNumber = 8;
  else if (byteLen <= 230) model.typeNumber = 9;
  else model.typeNumber = 10;

  model.make = function() {
    model.makeImpl(false, model.getBestMaskPattern());
  };

  model.makeImpl = function(test, maskPattern) {
    model.moduleCount = model.typeNumber * 4 + 17;
    model.modules = new Array(model.moduleCount);
    for (let row = 0; row < model.moduleCount; row++) {
      model.modules[row] = new Array(model.moduleCount);
      for (let col = 0; col < model.moduleCount; col++) {
        model.modules[row][col] = null;
      }
    }
    model.setupPositionProbePattern(0, 0);
    model.setupPositionProbePattern(model.moduleCount - 7, 0);
    model.setupPositionProbePattern(0, model.moduleCount - 7);
    model.setupPositionAdjustPattern();
    model.setupTimingPattern();
    model.setupTypeInfo(test, maskPattern);
    if (model.typeNumber >= 7) {
      model.setupTypeNumber(test);
    }
    if (model.dataCache == null) {
      model.dataCache = model.createData(model.typeNumber, model.errorCorrectLevel, model.dataList);
    }
    model.mapData(model.dataCache, maskPattern);
  };

  model.setupPositionProbePattern = function(row, col) {
    for (let r = -1; r <= 7; r++) {
      if (row + r <= -1 || model.moduleCount <= row + r) continue;
      for (let c = -1; c <= 7; c++) {
        if (col + c <= -1 || model.moduleCount <= col + c) continue;
        if ((0 <= r && r <= 6 && (c == 0 || c == 6)) ||
            (0 <= c && c <= 6 && (r == 0 || r == 6)) ||
            (2 <= r && r <= 4 && 2 <= c && c <= 4)) {
          model.modules[row + r][col + c] = true;
        } else {
          model.modules[row + r][col + c] = false;
        }
      }
    }
  };

  model.getBestMaskPattern = function() {
    let minLostPoint = 0;
    let bestMaskPattern = 0;
    for (let i = 0; i < 8; i++) {
      model.makeImpl(true, i);
      let lostPoint = QRUtil.getLostPoint(model);
      if (i == 0 || minLostPoint > lostPoint) {
        minLostPoint = lostPoint;
        bestMaskPattern = i;
      }
    }
    return bestMaskPattern;
  };

  model.setupTimingPattern = function() {
    for (let r = 8; r < model.moduleCount - 8; r++) {
      if (model.modules[r][6] != null) continue;
      model.modules[r][6] = (r % 2 == 0);
    }
    for (let c = 8; c < model.moduleCount - 8; c++) {
      if (model.modules[6][c] != null) continue;
      model.modules[6][c] = (c % 2 == 0);
    }
  };

  model.setupPositionAdjustPattern = function() {
    let pos = QRUtil.getPatternPosition(model.typeNumber);
    for (let i = 0; i < pos.length; i++) {
      for (let j = 0; j < pos.length; j++) {
        let row = pos[i];
        let col = pos[j];
        if (model.modules[row][col] != null) continue;
        for (let r = -2; r <= 2; r++) {
          for (let c = -2; c <= 2; c++) {
            if (r == -2 || r == 2 || c == -2 || c == 2 || (r == 0 && c == 0)) {
              model.modules[row + r][col + c] = true;
            } else {
              model.modules[row + r][col + c] = false;
            }
          }
        }
      }
    }
  };

  model.setupTypeNumber = function(test) {
    let bits = QRUtil.getBCHTypeNumber(model.typeNumber);
    for (let i = 0; i < 18; i++) {
      let mod = (!test && ((bits >> i) & 1) == 1);
      model.modules[Math.floor(i / 3)][i % 3 + model.moduleCount - 8 - 3] = mod;
    }
    for (let i = 0; i < 18; i++) {
      let mod = (!test && ((bits >> i) & 1) == 1);
      model.modules[i % 3 + model.moduleCount - 8 - 3][Math.floor(i / 3)] = mod;
    }
  };

  model.setupTypeInfo = function(test, maskPattern) {
    let data = (model.errorCorrectLevel << 3) | maskPattern;
    let bits = QRUtil.getBCHTypeInfo(data);
    for (let i = 0; i < 15; i++) {
      let mod = (!test && ((bits >> i) & 1) == 1);
      if (i < 6) model.modules[i][8] = mod;
      else if (i < 8) model.modules[i + 1][8] = mod;
      else model.modules[model.moduleCount - 15 + i][8] = mod;
    }
    for (let i = 0; i < 15; i++) {
      let mod = (!test && ((bits >> i) & 1) == 1);
      if (i < 8) model.modules[8][model.moduleCount - i - 1] = mod;
      else if (i < 9) model.modules[8][15 - i - 1 + 1] = mod;
      else model.modules[8][15 - i - 1] = mod;
    }
    model.modules[model.moduleCount - 8][8] = (!test);
  };

  model.mapData = function(data, maskPattern) {
    let inc = -1;
    let row = model.moduleCount - 1;
    let bitIndex = 7;
    let byteIndex = 0;

    for (let col = model.moduleCount - 1; col > 0; col -= 2) {
      if (col == 6) col--;
      while (true) {
        for (let c = 0; c < 2; c++) {
          if (model.modules[row][col - c] == null) {
            let dark = false;
            if (byteIndex < data.length) {
              dark = (((data[byteIndex] >>> bitIndex) & 1) == 1);
            }
            let mask = QRUtil.getMask(maskPattern, row, col - c);
            if (mask) {
              dark = !dark;
            }
            model.modules[row][col - c] = dark;
            bitIndex--;
            if (bitIndex == -1) {
              byteIndex++;
              bitIndex = 7;
            }
          }
        }
        row += inc;
        if (row < 0 || model.moduleCount <= row) {
          row -= inc;
          inc = -inc;
          break;
        }
      }
    }
  };

  model.createData = function(typeNumber, errorCorrectLevel, dataList) {
    let rsBlocks = QRRSBlock.getRSBlocks(typeNumber, errorCorrectLevel);
    let buffer = new QRBitBuffer();
    for (let i = 0; i < dataList.length; i++) {
      let data = dataList[i];
      buffer.put(data.mode, 4);
      buffer.put(data.getLength(), QRUtil.getLengthInBits(data.mode, typeNumber));
      data.write(buffer);
    }
    let totalDataCount = 0;
    for (let i = 0; i < rsBlocks.length; i++) {
      totalDataCount += rsBlocks[i].dataCount;
    }
    if (buffer.getLengthInBits() > totalDataCount * 8) {
      // 容错防止越界
      console.warn("QR buffer length overflow, truncating...");
    }
    if (buffer.getLengthInBits() + 4 <= totalDataCount * 8) {
      buffer.put(0, 4);
    }
    while (buffer.getLengthInBits() % 8 != 0) {
      buffer.putBit(false);
    }
    while (true) {
      if (buffer.getLengthInBits() >= totalDataCount * 8) break;
      buffer.put(0xec, 8);
      if (buffer.getLengthInBits() >= totalDataCount * 8) break;
      buffer.put(0x11, 8);
    }
    return model.createBytes(buffer, rsBlocks);
  };

  model.createBytes = function(buffer, rsBlocks) {
    let offset = 0;
    let maxDcCount = 0;
    let maxEcCount = 0;
    let dcdata = new Array(rsBlocks.length);
    let ecdata = new Array(rsBlocks.length);

    for (let r = 0; r < rsBlocks.length; r++) {
      let dcCount = rsBlocks[r].dataCount;
      let ecCount = rsBlocks[r].totalCount - dcCount;
      maxDcCount = Math.max(maxDcCount, dcCount);
      maxEcCount = Math.max(maxEcCount, ecCount);
      dcdata[r] = new Array(dcCount);
      for (let i = 0; i < dcdata[r].length; i++) {
        dcdata[r][i] = 0xff & buffer.buffer[i + offset];
      }
      offset += dcCount;

      let rsPoly = QRUtil.getErrorCorrectPolynomial(ecCount);
      let rawPoly = new QRPolynomial(dcdata[r], rsPoly.getLength() - 1);
      let modPoly = rawPoly.mod(rsPoly);
      ecdata[r] = new Array(rsPoly.getLength() - 1);
      for (let i = 0; i < ecdata[r].length; i++) {
        let modIndex = i + modPoly.getLength() - ecdata[r].length;
        ecdata[r][i] = (modIndex >= 0) ? modPoly.get(modIndex) : 0;
      }
    }

    let totalCodeCount = 0;
    for (let i = 0; i < rsBlocks.length; i++) {
      totalCodeCount += rsBlocks[i].totalCount;
    }
    let data = new Array(totalCodeCount);
    let index = 0;
    for (let i = 0; i < maxDcCount; i++) {
      for (let r = 0; r < rsBlocks.length; r++) {
        if (i < dcdata[r].length) {
          data[index++] = dcdata[r][i];
        }
      }
    }
    for (let i = 0; i < maxEcCount; i++) {
      for (let r = 0; r < rsBlocks.length; r++) {
        if (i < ecdata[r].length) {
          data[index++] = ecdata[r][i];
        }
      }
    }
    return data;
  };

  model.make();
  return model;
}

function QR8bitByte(data) {
  this.mode = 4; // 8-bit byte
  this.data = data;
}
QR8bitByte.prototype = {
  getLength: function() {
    return encodeURIComponent(this.data).replace(/%[89AB][0-9A-F]/gi, '^').length;
  },
  write: function(buffer) {
    const bytes = utf8Encode(this.data);
    for (let i = 0; i < bytes.length; i++) {
      buffer.put(bytes[i], 8);
    }
  }
};

function utf8Encode(str) {
  const bytes = [];
  for (let i = 0; i < str.length; i++) {
    let code = str.charCodeAt(i);
    if (code < 0x80) bytes.push(code);
    else if (code < 0x800) {
      bytes.push(0xc0 | (code >> 6), 0x80 | (code & 0x3f));
    } else if (code < 0xd800 || code >= 0xe000) {
      bytes.push(0xe0 | (code >> 12), 0x80 | ((code >> 6) & 0x3f), 0x80 | (code & 0x3f));
    } else {
      i++;
      code = 0x10000 + (((code & 0x33f) << 10) | (str.charCodeAt(i) & 0x3ff));
      bytes.push(0xf0 | (code >> 18), 0x80 | ((code >> 12) & 0x3f), 0x80 | ((code >> 6) & 0x3f), 0x80 | (code & 0x3f));
    }
  }
  return bytes;
}

const QRUtil = {
  PATTERN_POSITION_TABLE: [
    [], [6, 18], [6, 22], [6, 26], [6, 30], [6, 34], [6, 22, 38], [6, 24, 42],
    [6, 26, 46], [6, 28, 50], [6, 30, 54]
  ],
  G15: (1 << 10) | (1 << 8) | (1 << 5) | (1 << 4) | (1 << 2) | (1 << 1) | (1 << 0),
  G18: (1 << 12) | (1 << 11) | (1 << 10) | (1 << 9) | (1 << 8) | (1 << 5) | (1 << 2) | (1 << 0),
  G15_MASK: (1 << 14) | (1 << 12) | (1 << 10) | (1 << 4) | (1 << 1),

  getBCHTypeInfo: function(data) {
    let d = data << 10;
    while (QRUtil.getBCHDigit(d) - QRUtil.getBCHDigit(QRUtil.G15) >= 0) {
      d ^= (QRUtil.G15 << (QRUtil.getBCHDigit(d) - QRUtil.getBCHDigit(QRUtil.G15)));
    }
    return ((data << 10) | d) ^ QRUtil.G15_MASK;
  },
  getBCHTypeNumber: function(data) {
    let d = data << 12;
    while (QRUtil.getBCHDigit(d) - QRUtil.getBCHDigit(QRUtil.G18) >= 0) {
      d ^= (QRUtil.G18 << (QRUtil.getBCHDigit(d) - QRUtil.getBCHDigit(QRUtil.G18)));
    }
    return (data << 12) | d;
  },
  getBCHDigit: function(data) {
    let digit = 0;
    while (data != 0) {
      digit++;
      data >>>= 1;
    }
    return digit;
  },
  getPatternPosition: function(typeNumber) {
    return QRUtil.PATTERN_POSITION_TABLE[typeNumber - 1] || [];
  },
  getMask: function(maskPattern, i, j) {
    switch (maskPattern) {
      case 0: return (i + j) % 2 == 0;
      case 1: return i % 2 == 0;
      case 2: return j % 3 == 0;
      case 3: return (i + j) % 3 == 0;
      case 4: return (Math.floor(i / 2) + Math.floor(j / 3)) % 2 == 0;
      case 5: return (i * j) % 2 + (i * j) % 3 == 0;
      case 6: return ((i * j) % 2 + (i * j) % 3) % 2 == 0;
      case 7: return ((i * j) % 3 + (i + j) % 2) % 2 == 0;
      default: throw new Error("bad maskPattern:" + maskPattern);
    }
  },
  getErrorCorrectPolynomial: function(errorCorrectLength) {
    let a = new QRPolynomial([1], 0);
    for (let i = 0; i < errorCorrectLength; i++) {
      a = a.multiply(new QRPolynomial([1, QRMath.gexp(i)], 0));
    }
    return a;
  },
  getLengthInBits: function(mode, type) {
    if (1 <= type && type < 10) return 8;
    return 16;
  },
  getLostPoint: function(qrCode) {
    let moduleCount = qrCode.getModuleCount();
    let lostPoint = 0;
    for (let row = 0; row < moduleCount; row++) {
      for (let col = 0; col < moduleCount; col++) {
        let sameCount = 0;
        let dark = qrCode.isDark(row, col);
        for (let r = -1; r <= 1; r++) {
          if (row + r < 0 || moduleCount <= row + r) continue;
          for (let c = -1; c <= 1; c++) {
            if (col + c < 0 || moduleCount <= col + c) continue;
            if (r == 0 && c == 0) continue;
            if (dark == qrCode.isDark(row + r, col + c)) sameCount++;
          }
        }
        if (sameCount > 5) lostPoint += (3 + sameCount - 5);
      }
    }
    return lostPoint;
  }
};

const QRMath = {
  glog: function(n) {
    if (n < 1) return 0;
    return QRMath.LOG_TABLE[n] || 0;
  },
  gexp: function(n) {
    while (n < 0) n += 255;
    while (n >= 256) n -= 255;
    return QRMath.EXP_TABLE[n] || 0;
  },
  EXP_TABLE: new Array(256),
  LOG_TABLE: new Array(256)
};

for (let i = 0; i < 8; i++) QRMath.EXP_TABLE[i] = 1 << i;
for (let i = 8; i < 256; i++) {
  QRMath.EXP_TABLE[i] = QRMath.EXP_TABLE[i - 4] ^ QRMath.EXP_TABLE[i - 5] ^ QRMath.EXP_TABLE[i - 6] ^ QRMath.EXP_TABLE[i - 8];
}
for (let i = 0; i < 255; i++) QRMath.LOG_TABLE[QRMath.EXP_TABLE[i]] = i;

function QRPolynomial(num, shift) {
  if (num.length == undefined) throw new Error(num.length + "/" + shift);
  let offset = 0;
  while (offset < num.length && num[offset] == 0) offset++;
  this.num = new Array(num.length - offset + shift);
  for (let i = 0; i < num.length - offset; i++) {
    this.num[i] = num[i + offset];
  }
}
QRPolynomial.prototype = {
  get: function(index) { return this.num[index]; },
  getLength: function() { return this.num.length; },
  multiply: function(e) {
    let num = new Array(this.getLength() + e.getLength() - 1);
    for (let i = 0; i < num.length; i++) num[i] = 0;
    for (let i = 0; i < this.getLength(); i++) {
      for (let j = 0; j < e.getLength(); j++) {
        if (this.get(i) !== 0 && e.get(j) !== 0) {
          num[i + j] ^= QRMath.gexp(QRMath.glog(this.get(i)) + QRMath.glog(e.get(j)));
        }
      }
    }
    return new QRPolynomial(num, 0);
  },
  mod: function(e) {
    if (this.getLength() - e.getLength() < 0) return this;
    if (this.get(0) === 0) {
      return new QRPolynomial(this.num.slice(1), 0).mod(e);
    }
    let ratio = QRMath.glog(this.get(0)) - QRMath.glog(e.get(0));
    let num = new Array(this.getLength());
    for (let i = 0; i < this.getLength(); i++) num[i] = this.get(i);
    for (let i = 0; i < e.getLength(); i++) {
      if (e.get(i) !== 0) {
        num[i] ^= QRMath.gexp(QRMath.glog(e.get(i)) + ratio);
      }
    }
    return new QRPolynomial(num, 0).mod(e);
  }
};

// 纠错码块参数表 (Level L: 7% 纠错率)
function QRRSBlock(totalCount, dataCount) {
  this.totalCount = totalCount;
  this.dataCount = dataCount;
}
QRRSBlock.RS_BLOCK_TABLE = [
  [1, 26, 19],    // Version 1
  [1, 44, 34],    // Version 2
  [1, 70, 55],    // Version 3
  [1, 100, 80],   // Version 4
  [1, 134, 108],  // Version 5
  [2, 86, 68],    // Version 6
  [2, 98, 78],    // Version 7
  [2, 121, 97],   // Version 8
  [2, 146, 116],  // Version 9
  [2, 172, 137]   // Version 10
];
QRRSBlock.getRSBlocks = function(typeNumber, errorCorrectLevel) {
  const rsBlock = QRRSBlock.RS_BLOCK_TABLE[typeNumber - 1];
  if (!rsBlock) return [new QRRSBlock(100, 80)];
  const list = [];
  for (let i = 0; i < rsBlock[0]; i++) {
    list.push(new QRRSBlock(rsBlock[1] / rsBlock[0], rsBlock[2] / rsBlock[0]));
  }
  return list;
};

function QRBitBuffer() {
  this.buffer = [];
  this.length = 0;
}
QRBitBuffer.prototype = {
  get: function(index) {
    let bufIndex = Math.floor(index / 8);
    return ((this.buffer[bufIndex] >>> (7 - index % 8)) & 1) == 1;
  },
  put: function(num, length) {
    for (let i = 0; i < length; i++) {
      this.putBit(((num >>> (length - i - 1)) & 1) == 1);
    }
  },
  getLengthInBits: function() { return this.length; },
  putBit: function(bit) {
    let bufIndex = Math.floor(this.length / 8);
    if (this.buffer.length <= bufIndex) this.buffer.push(0);
    if (bit) this.buffer[bufIndex] |= (0x80 >>> (this.length % 8));
    this.length++;
  }
};
