import crypto from 'crypto';

export class BloomFilter {
  constructor(capacity = 100_000, fpRate = 0.001) {
    this.bitSize = Math.ceil((-capacity * Math.log(fpRate)) / (Math.LN2 ** 2));
    this.numHashes = Math.max(1, Math.round((this.bitSize / capacity) * Math.LN2));
    this.bits = new Uint8Array(Math.ceil(this.bitSize / 8));
    this.added = 0;
  }

  _positions(item) {
    const buf = Buffer.from(item, 'utf8');
    const positions = [];
    for (let i = 0; i < this.numHashes; i++) {
      const seed = Buffer.alloc(4);
      seed.writeUInt32BE(i);
      const hash = crypto.createHmac('sha256', seed).update(buf).digest();
      const pos = (hash.readUInt32BE(0) >>> 0) % this.bitSize;
      positions.push(pos);
    }
    return positions;
  }

  add(item) {
    for (const pos of this._positions(item)) {
      this.bits[pos >> 3] |= 1 << (pos & 7);
    }
    this.added++;
  }

  mightContain(item) {
    return this._positions(item).every(
      (pos) => (this.bits[pos >> 3] & (1 << (pos & 7))) !== 0
    );
  }

  get size() { return this.added; }
}
