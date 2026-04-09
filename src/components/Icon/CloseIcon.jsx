/**
 * Custom close (cross) icon — replaces all solar close variants for dismiss/close actions.
 *
 * @param {object}  props
 * @param {number}  [props.size=20]    — Width & height in px
 * @param {string}  [props.color='#6F7A90'] — Fill color
 * @param {string}  [props.className]
 */
export function CloseIcon({ size = 20, color = '#6F7A90', className, ...rest }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      {...rest}
    >
      <path
        d="M15.3536 5.35359C15.5488 5.15833 15.5488 4.84175 15.3536 4.64649C15.1583 4.45122 14.8417 4.45122 14.6464 4.64649L15 5.00004L15.3536 5.35359ZM4.64649 14.6464C4.45123 14.8417 4.45123 15.1583 4.64649 15.3536C4.84175 15.5488 5.15833 15.5488 5.3536 15.3536L5.00004 15L4.64649 14.6464ZM5.35355 4.64645C5.15829 4.45118 4.84171 4.45118 4.64645 4.64645C4.45118 4.84171 4.45118 5.15829 4.64645 5.35355L5 5L5.35355 4.64645ZM14.6464 15.3535C14.8417 15.5488 15.1582 15.5488 15.3535 15.3535C15.5488 15.1583 15.5488 14.8417 15.3535 14.6464L15 15L14.6464 15.3535ZM15 5.00004L14.6464 4.64649L9.64647 9.64647L10 10L10.3536 10.3536L15.3536 5.35359L15 5.00004ZM10 10L9.64647 9.64647L4.64649 14.6464L5.00004 15L5.3536 15.3536L10.3536 10.3536L10 10ZM5 5L4.64645 5.35355L9.64647 10.3536L10 10L10.3536 9.64647L5.35355 4.64645L5 5ZM10 10L9.64647 10.3536L14.6464 15.3535L15 15L15.3535 14.6464L10.3536 9.64647L10 10Z"
        fill={color}
      />
    </svg>
  );
}
