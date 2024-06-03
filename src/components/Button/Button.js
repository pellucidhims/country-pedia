
import "./Button.css"


function Button({
    ...props
}) {
    const  {className = "", variant = "info", onClick = () => {}, buttonLabel, children} = props;

    return (
        <button 
          className={`buttonClass ${className} ${variant}`}
          onClick={onClick}
          aria-label="Button click"
          {...props}
        >
            {buttonLabel || children}
        </button>
    )
}

export default Button;