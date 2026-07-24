
const DEV_KEY_B64 = 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=';
let _devKeyWarned = false;

function devKey() {
  if (!_devKeyWarned) {
    console.warn(
      '\n[keyManager] WARNING: MASTER_KEY is not set. ' +
      'Using an insecure dev key — encrypted data CANNOT be recovered after an env change. ' +
      'Run: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'base64\'))" ' +
      'and add MASTER_KEY=<output> to backend/.env\n'
    );
    _devKeyWarned = true;
  }
  return Buffer.from(DEV_KEY_B64, 'base64');
}

export function getActiveKek() {
  const b64 = process.env.MASTER_KEY;
  if (!b64) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('MASTER_KEY env var is required in production.');
    }
    return devKey();
  }
  const key = Buffer.from(b64, 'base64');
  if (key.length !== 32) throw new Error('MASTER_KEY must decode to exactly 32 bytes.');
  return key;
}

export function getActiveKeyVersion() {
  return parseInt(process.env.KEY_VERSION || '1', 10);
}


export function getKekForVersion(version) {
  const activeVersion = getActiveKeyVersion();

  if (version === activeVersion || version == null) {
    return getActiveKek();
  }

  const envKey = `MASTER_KEY_${version}`;
  const b64 = process.env[envKey];
  if (!b64) {
    throw new Error(
      `Cannot decrypt blob encrypted under key version ${version}. ` +
      `Set the ${envKey} env var to the old master key.`
    );
  }
  const key = Buffer.from(b64, 'base64');
  if (key.length !== 32) throw new Error(`${envKey} must decode to exactly 32 bytes.`);
  return key;
}
