interface MaskResult {
    valid: boolean;
    result: string;
}

export interface IMaskOptions {
    reverse?: boolean;
    useDefaults?: boolean;
}

class ZikiMaskString {
    private _pattern: string = '';
    private _options: IMaskOptions = { reverse: false, useDefaults: false };

    private _tokens = {
        '0': { pattern: /\d/, _default: '0' },
        '9': { pattern: /\d/, optional: true },
        '#': { pattern: /\d/, optional: true, recursive: true },
        'A': { pattern: /[a-zA-Z0-9]/ },
        'S': { pattern: /[a-zA-Z]/ },
        'U': { pattern: /[a-zA-Z]/, transform: function (c) { return c.toLocaleUpperCase(); } },
        'L': { pattern: /[a-zA-Z]/, transform: function (c) { return c.toLocaleLowerCase(); } },
        '$': { escape: true }
    };

    private isEscaped(pattern, pos) {
        let _count = 0;
        let _i = pos - 1;
        let _token = { escape: true };
        while (_i >= 0 && _token && _token.escape) {
            _token = this._tokens[pattern.charAt(_i)];
            _count += _token && _token.escape ? 1 : 0;
            _i--;
        }
        return _count > 0 && _count % 2 === 1;
    }

    private calcOptionalNumbersToUse(pattern, value) {
        let _numbersInP = pattern.replace(/[^0]/g, '').length;
        let _numbersInV = value.replace(/[^\d]/g, '').length;
        return _numbersInV - _numbersInP;
    }

    private concatChar(text, character, options, token) {
        if (token && typeof token.transform === 'function') {
            character = token.transform(character);
        }
        if (options.reverse) {
            return character + text;
        }
        return text + character;
    }

    private hasMoreTokens(pattern, pos, inc) {
        let _pc = pattern.charAt(pos);
        let _token = this._tokens[_pc];
        if (_pc === '') {
            return false;
        }
        return _token && !_token.escape ? true : this.hasMoreTokens(pattern, pos + inc, inc);
    }

    private hasMoreRecursiveTokens(pattern, pos, inc) {
        let _pc = pattern.charAt(pos);
        let _token = this._tokens[_pc];
        if (_pc === '') {
            return false;
        }
        return _token && _token.recursive ? true : this.hasMoreRecursiveTokens(pattern, pos + inc, inc);
    }

    private insertChar(text, char, position) {
        let _t = text.split('');
        _t.splice(position, 0, char);
        return _t.join('');
    }

    private proccess(value): MaskResult {
        if (!value) {
            return <MaskResult>{ result: '', valid: false };
        }
        value = value + '';
        let _pattern2 = this._pattern;
        let _valid = true;
        let _formatted = '';
        let _valuePos = this._options.reverse ? value.length - 1 : 0;
        let _patternPos = 0;
        let _optionalNumbersToUse = this.calcOptionalNumbersToUse(_pattern2, value);
        let _escapeNext = false;
        let _recursive = [];
        let _inRecursiveMode = false;

        let _steps = {
            start: this._options.reverse ? _pattern2.length - 1 : 0,
            end: this._options.reverse ? -1 : _pattern2.length,
            inc: this._options.reverse ? -1 : 1
        };

        let continueCondition = (options) => {
            if (!_inRecursiveMode && !_recursive.length && this.hasMoreTokens(_pattern2, _patternPos, _steps.inc)) {
                return true;
            }
            else if (!_inRecursiveMode && _recursive.length &&
                this.hasMoreRecursiveTokens(_pattern2, _patternPos, _steps.inc)) {
                return true;
            }
            else if (!_inRecursiveMode) {
                _inRecursiveMode = _recursive.length > 0;
            }

            if (_inRecursiveMode) {
                let _pc = _recursive.shift();
                _recursive.push(_pc);
                if (options.reverse && _valuePos >= 0) {
                    _patternPos++;
                    _pattern2 = this.insertChar(_pattern2, _pc, _patternPos);
                    return true;
                }
                else if (!options.reverse && _valuePos < value.length) {
                    _pattern2 = this.insertChar(_pattern2, _pc, _patternPos);
                    return true;
                }
            }
            return _patternPos < _pattern2.length && _patternPos >= 0;
        }

        for (_patternPos = _steps.start; continueCondition(this._options); _patternPos = _patternPos + _steps.inc) {
            let _vc = value.charAt(_valuePos);
            let _pc = _pattern2.charAt(_patternPos);

            let _token = this._tokens[_pc];
            if (_recursive.length && _token && !_token.recursive) {
                _token = null;
            }

            if (!_inRecursiveMode || _vc) {
                if (this._options.reverse && this.isEscaped(_pattern2, _patternPos)) {
                    _formatted = this.concatChar(_formatted, _pc, this._options, _token);
                    _patternPos = _patternPos + _steps.inc;
                    continue;
                }
                else if (!this._options.reverse && _escapeNext) {
                    _formatted = this.concatChar(_formatted, _pc, this._options, _token);
                    _escapeNext = false;
                    continue;
                }
                else if (!this._options.reverse && _token && _token.escape) {
                    _escapeNext = true;
                    continue;
                }
            }

            if (!_inRecursiveMode && _token && _token.recursive) {
                _recursive.push(_pc);
            }
            else if (_inRecursiveMode && !_vc) {
                _formatted = this.concatChar(_formatted, _pc, this._options, _token);
                continue;
            }
            else if (!_inRecursiveMode && _recursive.length > 0 && !_vc) {
                continue;
            }

            if (!_token) {
                _formatted = this.concatChar(_formatted, _pc, this._options, _token);
                if (!_inRecursiveMode && _recursive.length) {
                    _recursive.push(_pc);
                }
            }
            else if (_token.optional) {
                if (_token.pattern.test(_vc) && _optionalNumbersToUse) {
                    _formatted = this.concatChar(_formatted, _vc, this._options, _token);
                    _valuePos = _valuePos + _steps.inc;
                    _optionalNumbersToUse--;
                }
                else if (_recursive.length > 0 && _vc) {
                    _valid = false;
                    break;
                }
            }
            else if (_token.pattern.test(_vc)) {
                _formatted = this.concatChar(_formatted, _vc, this._options, _token);
                _valuePos = _valuePos + _steps.inc;
            }
            else if (!_vc && _token._default && this._options.useDefaults) {
                _formatted = this.concatChar(_formatted, _token._default, this._options, _token);
            }
            else {
                _valid = false;
                break;
            }
        }

        return <MaskResult>{ result: _formatted, valid: _valid };
    };

    public setPattern(pattern: string) {
        this._pattern = pattern;
    }

    public setOptions(opt: IMaskOptions) {
        this._options = opt;
    }

    public apply(value: string): string {
        return this.proccess(value).result;
    }

    public validate(value: string): boolean {
        return this.proccess(value).valid;
    }

}

class ZikiMaskBuilder {
    public static string(pattern?: string, opt?: IMaskOptions) {
        let _mask = new ZikiMaskString();
        _mask.setPattern(pattern);
        _mask.setOptions(opt);
        return _mask;
    }
}

export function stringMask(value:string,pattern:string,opt?:IMaskOptions): string {
    return ZikiMaskBuilder.string(pattern, opt).apply(value);
}
