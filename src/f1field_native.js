/* global BigInt */
const assert = require("assert");
const Scalar = require("./scalar");
const futils = require("./futils");

function getRandomByte() {
    if (typeof window !== "undefined") { // Browser
        if (typeof window.crypto !== "undefined") { // Supported
            let array = new Uint8Array(1);
            window.crypto.getRandomValues(array);
            return array[0];
        }
        else { // fallback
            return Math.floor(Math.random() * 256);
        }
    }
    else { // NodeJS
        return module.require("crypto").randomBytes(1)[0];
    }
}

module.exports = class ZqField {
    constructor(p) {
        this.one = 1n;
        this.zero = 0n;
        this.p = BigInt(p);
        this.minusone = this.p-1n;
        this.two = 2n;
        this.half = this.p >> 1n;
        this.bitLength = Scalar.bitLength(this.p);
        this.mask = (1n << BigInt(this.bitLength)) - 1n;

        this.n64 = Math.floor((this.bitLength - 1) / 64)+1;
        this.R = this.e(1n << BigInt(this.n64*64));

        const e = this.minusone >> 1n;
        this.nqr = this.two;
        let r = this.pow(this.nqr, e);
        while (!this.eq(r, this.minusone)) {
            this.nqr = this.nqr + 1n;
            r = this.pow(this.nqr, e);
        }

        this.s = 0;
        this.t = this.minusone;

        while ((this.t & 1n) == 0n) {
            this.s = this.s + 1;
            this.t = this.t >> 1n;
        }

        this.nqr_to_t = this.pow(this.nqr, this.t);
    }

    e(a,b) {
        let res;
        if (!b) {
            res = BigInt(a);
        } else if (b==16) {
            res = BigInt("0x"+a);
        }
        if (res < 0) {
            let nres = -res;
            if (nres >= this.p) nres = nres % this.p;
            return this.p - nres;
        } else {
            return (res>= this.p) ? res%this.p : res;
        }

    }

    add(a, b) {
        const res = a + b;
        return res >= this.p ? res-this.p : res;
    }

    sub(a, b) {
        return (a >= b) ? a-b : this.p-b+a;
    }

    neg(a) {
        return a ? this.p-a : a;
    }

  toRprLE(buff, o, e) {
      const n8 = this.n64*8;
    console.log(e);
    console.log(e.toString(16));
      const s = "0000000" + e.toString(16);
      const v = new Uint32Array(buff.buffer, o, n8/4);
      const l = (((s.length-7)*4 - 1) >> 5)+1;    // Number of 32bit words;
      for (let i=0; i<l; i++) v[i] = parseInt(s.substring(s.length-8*i-8, s.length-8*i), 16);
      for (let i=l; i<v.length; i++) v[i] = 0;
      for (let i=v.length*4; i<n8; i++) buff[i] = Scalar.toNumber(Scalar.band(Scalar.shiftRight(e, i*8), 0xFF));
  };

    // toObject(a) {
    //     return Scalar.fromRprLE(a);
    // }

    mul(a, b) {
        return (a*b)%this.p;
    }

    mulScalar(base, s) {
        return (base * this.e(s)) % this.p;
    }

    square(a) {
        return (a*a) % this.p;
    }

    eq(a, b) {
        return a==b;
    }

    neq(a, b) {
        return a!=b;
    }

    lt(a, b) {
        const aa = (a > this.half) ? a - this.p : a;
        const bb = (b > this.half) ? b - this.p : b;
        return aa < bb;
    }

    gt(a, b) {
        const aa = (a > this.half) ? a - this.p : a;
        const bb = (b > this.half) ? b - this.p : b;
        return aa > bb;
    }

    leq(a, b) {
        const aa = (a > this.half) ? a - this.p : a;
        const bb = (b > this.half) ? b - this.p : b;
        return aa <= bb;
    }

    geq(a, b) {
        const aa = (a > this.half) ? a - this.p : a;
        const bb = (b > this.half) ? b - this.p : b;
        return aa >= bb;
    }

    div(a, b) {
        return this.mul(a, this.inv(b));
    }

    idiv(a, b) {
        assert(b, "Division by zero");
        return a / b;
    }

    inv(a) {
        assert(a, "Division by zero");

        let t = 0n;
        let r = this.p;
        let newt = 1n;
        let newr = a % this.p;
        while (newr) {
            let q = r/newr;
            [t, newt] = [newt, t-q*newt];
            [r, newr] = [newr, r-q*newr];
        }
        if (t<0n) t += this.p;
        return t;
    }

    mod(a, b) {
        return a % b;
    }

    pow(b, e) {
        return futils.exp(this, b, e);
    }

    band(a, b) {
        const res =  ((a & b) & this.mask);
        return res >= this.p ? res-this.p : res;
    }

    bor(a, b) {
        const res =  ((a | b) & this.mask);
        return res >= this.p ? res-this.p : res;
    }

    bxor(a, b) {
        const res =  ((a ^ b) & this.mask);
        return res >= this.p ? res-this.p : res;
    }

    bnot(a) {
        const res = a ^ this.mask;
        return res >= this.p ? res-this.p : res;
    }

    shl(a, b) {
        if (Number(b) < this.bitLength) {
            const res = (a << b) & this.mask;
            return res >= this.p ? res-this.p : res;
        } else {
            const nb = this.p - b;
            if (Number(nb) < this.bitLength) {
                return a >> nb;
            } else {
                return 0n;
            }
        }
    }

    shr(a, b) {
        if (Number(b) < this.bitLength) {
            return a >> b;
        } else {
            const nb = this.p - b;
            if (Number(nb) < this.bitLength) {
                const res = (a << nb) & this.mask;
                return res >= this.p ? res-this.p : res;
            } else {
                return 0;
            }
        }
    }

    land(a, b) {
        return (a && b) ? 1n : 0n;
    }

    lor(a, b) {
        return (a || b) ? 1n : 0n;
    }

    lnot(a) {
        return (a) ? 0n : 1n;
    }

    sqrt(n) {

        if (n == 0n) return this.zero;

        // Test that have solution
        const res = this.pow(n, this.minusone >> this.one);
        if ( res != 1n ) return null;

        let m = this.s;
        let c = this.nqr_to_t;
        let t = this.pow(n, this.t);
        let r = this.pow(n, this.add(this.t, this.one) >> 1n );

        while ( t != 1n ) {
            let sq = this.square(t);
            let i = 1;
            while (sq != 1n ) {
                i++;
                sq = this.square(sq);
            }

            // b = c ^ m-i-1
            let b = c;
            for (let j=0; j< m-i-1; j ++) b = this.square(b);

            m = i;
            c = this.square(b);
            t = this.mul(t, c);
            r = this.mul(r, b);
        }

        if (r > (this.p >> 1n)) {
            r = this.neg(r);
        }

        return r;
    }

    normalize(a, b) {
        a = BigInt(a,b);
        if (a < 0) {
            let na = -a;
            if (na >= this.p) na = na % this.p;
            return this.p - na;
        } else {
            return (a>= this.p) ? a%this.p : a;
        }
    }

    random() {
        const nBytes = (this.bitLength*2 / 8);
        let res =0n;
        for (let i=0; i<nBytes; i++) {
            res = (res << 8n) + BigInt(getRandomByte());
        }
        return res % this.p;
    }

    toString(a, base) {
        let vs;
        if (a > this.half) {
            const v = this.p-a;
            vs = "-"+v.toString(base);
        } else {
            vs = a.toString(base);
        }
        return vs;
    }

    isZero(a) {
        return a == 0n;
    }

};

