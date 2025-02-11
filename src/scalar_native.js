/* global BigInt */
const assert = require("assert");
const hexLen = [ 0, 1, 2, 2, 3, 3, 3, 3, 4 ,4 ,4 ,4 ,4 ,4 ,4 ,4];

// Pases a buffer with Little Endian Representation
module.exports.fromRprLE = function fromRprLE(buff, o, n8) {
    n8 = n8 || buff.byteLength;
    o = o || 0;
    const v = new Uint32Array(buff.buffer, o, n8/4);
    const a = new Array(n8/4);
    v.forEach( (ch,i) => a[a.length-i-1] = ch.toString(16).padStart(8,"0") );
    return module.exports.fromString(a.join(""), 16);
}

module.exports.fromString = function fromString(s, radix) {
    if ((!radix)||(radix==10)) {
      try {
        return BigInt(s);
      } catch(e) {
        return module.exports.fromRprLE(s, 0);
      }
    } else if (radix==16) {
        if (s.slice(0,2) == "0x") {
            return BigInt(s);
        } else {
            return BigInt("0x"+s);
        }
    }
};

module.exports.e = module.exports.fromString;

module.exports.fromArray = function fromArray(a, radix) {
    let acc =0n;
    radix = BigInt(radix);
    for (let i=0; i<a.length; i++) {
        acc = acc*radix + BigInt(a[i]);
    }
    return acc;
};

module.exports.bitLength = function (a) {
    const aS =a.toString(16);
    return (aS.length-1)*4 +hexLen[parseInt(aS[0], 16)];
};

module.exports.isNegative = function (a) {
    return BigInt(a) < 0n;
};

module.exports.isZero = function (a) {
    return !a;
};

module.exports.shiftLeft = function (a, n) {
    return BigInt(a) << BigInt(n);
};

module.exports.shiftRight = function (a, n) {
    return BigInt(a) >> BigInt(n);
};

module.exports.shl = module.exports.shiftLeft;
module.exports.shr = module.exports.shiftRight;

module.exports.isOdd = function (a) {
    return (BigInt(a) & 1n) == 1n;
};


module.exports.naf = function naf(n) {
    let E = BigInt(n);
    const res = [];
    while (E) {
        if (E & 1n) {
            const z = 2 - Number(E % 4n);
            res.push( z );
            E = E - BigInt(z);
        } else {
            res.push( 0 );
        }
        E = E >> 1n;
    }
    return res;
};


module.exports.bits = function naf(n) {
    let E = BigInt(n);
    const res = [];
    while (E) {
        if (E & 1n) {
            res.push(1);
        } else {
            res.push( 0 );
        }
        E = E >> 1n;
    }
    return res;
};

module.exports.toNumber = function(s) {
    assert(s<BigInt(Number.MAX_SAFE_INTEGER + 1));
    return Number(s);
};

module.exports.toArray = function(s, radix) {
    const res = [];
    let rem = BigInt(s);
    radix = BigInt(radix);
    while (rem) {
        res.unshift( Number(rem % radix));
        rem = rem / radix;
    }
    return res;
};


module.exports.add = function(a, b) {
    return BigInt(a) + BigInt(b);
};

module.exports.sub = function(a, b) {
    return BigInt(a) - BigInt(b);
};

module.exports.neg = function(a) {
    return -BigInt(a);
};

module.exports.mul = function(a, b) {
    return BigInt(a) * BigInt(b);
};

module.exports.square = function(a) {
    return BigInt(a) * BigInt(a);
};

module.exports.pow = function(a, b) {
    return BigInt(a) ** BigInt(b);
};

module.exports.abs = function(a) {
    return BigInt(a) >= 0 ? BigInt(a) : -BigInt(a);
};

module.exports.div = function(a, b) {
    return BigInt(a) / BigInt(b);
};

module.exports.mod = function(a, b) {
    return BigInt(a) % BigInt(b);
};

module.exports.eq = function(a, b) {
    return BigInt(a) == BigInt(b);
};

module.exports.neq = function(a, b) {
    return BigInt(a) != BigInt(b);
};

module.exports.lt = function(a, b) {
    return BigInt(a) < BigInt(b);
};

module.exports.gt = function(a, b) {
    return BigInt(a) > BigInt(b);
};

module.exports.leq = function(a, b) {
    return BigInt(a) <= BigInt(b);
};

module.exports.geq = function(a, b) {
    return BigInt(a) >= BigInt(b);
};

module.exports.band = function(a, b) {
    return BigInt(a) & BigInt(b);
};

module.exports.bor = function(a, b) {
    return BigInt(a) | BigInt(b);
};

module.exports.bxor = function(a, b) {
    return BigInt(a) ^ BigInt(b);
};

module.exports.land = function(a, b) {
    return BigInt(a) && BigInt(b);
};

module.exports.lor = function(a, b) {
    return BigInt(a) || BigInt(b);
};

module.exports.lnot = function(a) {
    return !BigInt(a);
};

