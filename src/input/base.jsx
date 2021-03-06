import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import {func} from '../util';
import zhCN from '../locale/zh-cn';

class Base extends React.Component {
    static propTypes = {
        /**
         * 样式前缀
         */
        prefix: PropTypes.string,
        /**
         * 当前值
         */
        value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        /**
         * 初始化值
         */
        defaultValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        /**
         * 发生改变的时候触发的回调
         * @param {String} value 数据
         * @param {Event} e DOM事件对象
         */
        onChange: PropTypes.func,
        /**
         * 键盘按下的时候触发的回调
         * @param {Event} e DOM事件对象
         * @param {Object} opts 可扩展的附加信息：<br> - opts.overMaxLength: {Boolean} 已超出最大长度<br> - opts.beTrimed: {Boolean} 输入的空格被清理
         */
        onKeyDown: PropTypes.func,
        /**
         * 禁用状态
         */
        disabled: PropTypes.bool,
        /**
         * 最大长度
         */
        maxLength: PropTypes.number,
        /**
         * 是否展现最大长度样式
         */
        hasLimitHint: PropTypes.bool,
        /**
         * 当设置了maxLength时，是否截断超出字符串
         */
        cutString: PropTypes.bool,
        /**
         * 只读
         */
        readOnly: PropTypes.bool,
        /**
         * onChange返回会自动去除头尾空字符
         */
        trim: PropTypes.bool,
        /**
         * 输入提示
         */
        placeholder: PropTypes.string,
        /**
         * 获取焦点时候触发的回调
         */
        onFocus: PropTypes.func,
        /**
         * 失去焦点时候触发的回调
         */
        onBlur: PropTypes.func,
        /**
         * 自定义字符串计算长度方式
         * @param {String} value 数据
         * @returns {Number} 自定义长度
         */
        getValueLength: PropTypes.func,
        inputStyle: PropTypes.object,
        /**
         * 自定义class
         */
        className: PropTypes.string,
        /**
         * 自定义内联样式
         */
        style: PropTypes.object,
        /**
         * 原生type
         */
        htmlType: PropTypes.string,
        state: PropTypes.oneOf(['error', 'loading', 'success']),
        locale: PropTypes.object,
    };

    static defaultProps = {
        disabled: false,
        prefix: 'next-',
        maxLength: null,
        hasLimitHint: false,
        cutString: true,
        readOnly: false,
        trim: false,
        onFocus: func.noop,
        onBlur: func.noop,
        onChange: func.noop,
        onKeyDown: func.noop,
        getValueLength: func.noop,
        locale: zhCN.Input,
    };

    componentWillReceiveProps(nextProps) {
        if ('value' in nextProps) {
            this.setState({
                value: typeof nextProps.value === 'undefined' ? '' : nextProps.value
            });
        }
    }

    ieHack(value) {
        return value;
    }

    onChange(e) {
        let value = e.target.value;

        if (this.props.trim) {
            value = value.trim();
        }

        value = this.ieHack(value);

        // not controlled
        if (!('value' in this.props)) {
            this.setState({
                value
            });
        }

        if (this.props.htmlType === 'number') {
            value = Number(value);
        }

        this.props.onChange(value, e);
    }

    onKeyDown(e) {
        const value = e.target.value;
        const { maxLength } = this.props;
        const len = maxLength > 0 && value ? this.getValueLength(value) : 0;
        const opts = {};

        // has enable trim and has input whitespace
        if (this.props.trim && e.keyCode === 32) {
            opts.beTrimed = true;
        }

        // has defined maxLength and has over max length and has not input backspace and delete
        if (maxLength > 0 && (len > maxLength + 1 ||
                ((len === maxLength || len === maxLength + 1) && e.keyCode !== 8 && e.keyCode !== 46)
        )) {
            opts.overMaxLength = true;
        }

        this.props.onKeyDown(e, opts);
    }

    onFocus(e) {
        this.setState({
            focus: true
        });
        this.props.onFocus(e);
    }

    onBlur(e) {
        this.setState({
            focus: false
        });
        this.props.onBlur(e);
    }

    renderLength() {
        const { maxLength, hasLimitHint, prefix } = this.props;
        const len = maxLength > 0 && this.state.value ? this.getValueLength(this.state.value) : 0;

        const classesLenWrap = classNames({
            [`${prefix}input-len`]: true,
            [`${prefix}error`]: len > maxLength
        });

        return maxLength && hasLimitHint ? <span className={classesLenWrap}>{len}/{maxLength}</span> : null;
    }

    renderControl() {
        const lenWrap = this.renderLength();

        return lenWrap ? <span className={`${this.props.prefix}input-control`}>
            {lenWrap}
        </span> : null;
    }

    getClass() {
        const { disabled, state, prefix } = this.props;

        return classNames({
            [`${prefix}input`]: true,
            [`${prefix}disabled`]: !!disabled,
            [`${prefix}error`]: state === 'error',
            [`${prefix}focus`]: this.state.focus,
        });
    }

    getProps() {
        const { placeholder, inputStyle, disabled, readOnly, cutString, maxLength } = this.props;
        const props = {
            style: inputStyle,
            placeholder,
            disabled,
            readOnly,
            maxLength: cutString ? maxLength : undefined,
            value: this.state.value,
            onChange: this.onChange.bind(this),
            onBlur: this.onBlur.bind(this),
            onFocus: this.onFocus.bind(this),
        };

        // fix accessibility：auto process status of aria disabled
        if (disabled) {
            props['aria-disabled'] = disabled;
        }

        return props;
    }

    saveRef = (input) => {
        this.inputRef = input;
    };

    getInputNode() {
        return this.inputRef;
    }

    focus(start, end) {
        this.inputRef.focus();
        if (typeof start !== 'undefined') {
            this.inputRef.selectionStart = start;
        }
        if (typeof end !== 'undefined') {
            this.inputRef.selectionEnd = end;
        }
    }
}

export default Base;
