const bigInt = require("big-integer");
const assert = require("assert");

module.exports.fromString = function fromString(s, radix) {
    if (typeof s == "string") {
        if (s.slice(0,2) == "0x") {
            return bigInt(s.slice(2), 16);
        } else {
            return bigInt(s,radix);
        }
    } else {
        return bigInt(s, radix);
    }
};

// Pases a buffer with Little Endian Representation
module.exports.fromRprLE = function fromRprLE(buff, o, n8) {
    n8 = n8 || buff.byteLength;
    o = o || 0;
    const v = new Uint32Array(buff.buffer, o, n8/4);
    const a = new Array(n8/4);
    v.forEach( (ch,i) => a[a.length-i-1] = ch.toString(16).padStart(8,"0") );
    return fromString(a.join(""), 16);
}

module.exports.e = module.exports.fromString;

module.exports.fromArray = function fromArray(a, radix) {
    return bigInt.fromArray(a, radix);
};

module.exports.bitLength = function (a) {
    return bigInt(a).bitLength();
};

module.exports.isNegative = function (a) {
    return bigInt(a).isNegative();
};

module.exports.isZero = function (a) {
    return bigInt(a).isZero();
};

module.exports.shiftLeft = function (a, n) {
    return bigInt(a).shiftLeft(n);
};

module.exports.shiftRight = function (a, n) {
    return bigInt(a).shiftRight(n);
};

module.exports.shl = module.exports.shiftLeft;
module.exports.shr = module.exports.shiftRight;

module.exports.isOdd = function (a) {
    return bigInt(a).isOdd();
};


module.exports.naf = function naf(n) {
    let E = bigInt(n);
    const res = [];
    while (E.gt(bigInt.zero)) {
        if (E.isOdd()) {
            const z = 2 - E.mod(4).toJSNumber();
            res.push( z );
            E = E.minus(z);
        } else {
            res.push( 0 );
        }
        E = E.shiftRight(1);
    }
    return res;
};


module.exports.bits = function naf(n) {
    let E = bigInt(n);
    const res = [];
    while (E.gt(bigInt.zero)) {
        if (E.isOdd()) {
            res.push(1);
        } else {
            res.push( 0 );
        }
        E = E.shiftRight(1);
    }
    return res;
};

module.exports.toNumber = function(s) {
    assert(s.lt(bigInt("9007199254740992", 10)));
    return s.toJSNumber();
};

module.exports.toArray = function(s, radix) {
    return bigInt(s).toArray(radix);
};

module.exports.add = function(a, b) {
    return bigInt(a).add(bigInt(b));
};

module.exports.sub = function(a, b) {
    return bigInt(a).minus(bigInt(b));
};

module.exports.neg = function(a) {
    return bigInt.zero.minus(bigInt(a));
};

module.exports.mul = function(a, b) {
    return bigInt(a).times(bigInt(b));
};

module.exports.square = function(a) {
    return bigInt(a).square();
};

module.exports.pow = function(a, b) {
    return bigInt(a).pow(bigInt(b));
};

module.exports.abs = function(a) {
    return bigInt(a).abs();
};

module.exports.div = function(a, b) {
    return bigInt(a).divide(bigInt(b));
};

module.exports.mod = function(a, b) {
    return bigInt(a).mod(bigInt(b));
};

module.exports.eq = function(a, b) {
    return bigInt(a).eq(bigInt(b));
};

module.exports.neq = function(a, b) {
    return bigInt(a).neq(bigInt(b));
};

module.exports.lt = function(a, b) {
    return bigInt(a).lt(bigInt(b));
};

module.exports.gt = function(a, b) {
    return bigInt(a).gt(bigInt(b));
};

module.exports.leq = function(a, b) {
    return bigInt(a).leq(bigInt(b));
};

module.exports.geq = function(a, b) {
    return bigInt(a).geq(bigInt(b));
};

module.exports.band = function(a, b) {
    return bigInt(a).and(bigInt(b));
};

module.exports.bor = function(a, b) {
    return bigInt(a).or(bigInt(b));
};

module.exports.bxor = function(a, b) {
    return bigInt(a).xor(bigInt(b));
};

module.exports.band = function(a, b) {
    return (!bigInt(a).isZero()) && (!bigInt(b).isZero());
};

module.exports.bor = function(a, b) {
    return (!bigInt(a).isZero()) || (!bigInt(b).isZero());
};

module.exports.bnot = function(a) {
    return bigInt(a).isZero();
};


