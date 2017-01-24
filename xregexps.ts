function transpileRE(source: string, extended: boolean, multiline: boolean): string {
  if (! extended && ! multiline) return source;
  var convertedSource = '', len = source.length;
  var inCharClass = false, inComment = false, justBackslashed = false;
  for (var i = 0; i < len; i ++) {
    var c = source.charAt(i);
    if (justBackslashed) {
      if (! inComment) convertedSource += c;
      justBackslashed = false;
      continue;
    }
    if (c == '\\') {
      if (! inComment) convertedSource += c;
      justBackslashed = true;
      continue;
    }
    if (inCharClass) {
      convertedSource += c;
      if (c == ']') inCharClass = false;
      continue;
    }
    if (inComment) {
      if (c == "\n" || c == "\r") inComment = false;
      continue;
    }
    if (c == '[') {
      convertedSource += c;
      inCharClass = true;
      continue;
    }
    if (extended && c == '#') {
      inComment = true;
      continue;
    }
    if (multiline && c == '.') {
      convertedSource += '[\\s\\S]';
      continue;
    }
    if (! extended || ! c.match(/\s/)) convertedSource += c;
  }
  return convertedSource;
}

function reassembleRE(literals: TemplateStringsArray, values: any[]): string {
  var source = '', rawLiterals = literals.raw, value: string;
  for (var i = 0, len = rawLiterals.length; i < len; i ++) {
    source += rawLiterals[i];
    if (value = values[i]) source += String(value);
  }
  return source;
}

export function xRegExp(literals: TemplateStringsArray, ... values) {
  return (flags: string): RegExp => {
    const x = flags.indexOf('x') != -1;
    const mm = flags.indexOf('mm') != -1;
    flags = flags.replace('x', '').replace('mm', 'm');
    const source = transpileRE(reassembleRE(literals, values), x, mm);
    return new RegExp(source, flags);
  }
}