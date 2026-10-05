import React from "react";

export interface PearlButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string;
  variant?: "default" | "hero" | "header" | "sm" | "full";
  sparkle?: boolean;
  href?: string;
  target?: string;
  rel?: string;
  asAnchor?: boolean;
}

/**
 * PearlButton - Magic Scissors Luxury Editorial Pearl Button
 *
 * Direct visual & interactive implementation inspired by the pearl/glossy glass reference.
 * Tailored for Magic Scissors: deep obsidian/charcoal noir base, champagne terracotta bronze
 * micro-accents, prismatic pearl highlight edge, tactile click dynamics, and smooth sparkle transitions.
 */
export const PearlButton = React.forwardRef<
  HTMLButtonElement & HTMLAnchorElement,
  PearlButtonProps
>(
  (
    {
      label = "Pearl Button",
      children,
      className = "",
      variant = "default",
      sparkle = true,
      href,
      type = "button",
      disabled,
      ...props
    },
    ref
  ) => {
    const variantClass =
      variant === "hero"
        ? "pearl-button--hero"
        : variant === "header"
        ? "pearl-button--header"
        : variant === "sm"
        ? "pearl-button--sm"
        : variant === "full"
        ? "pearl-button--full"
        : "";

    const combinedClassName = ["pearl-button", variantClass, className]
      .filter(Boolean)
      .join(" ");

    const content = (
      <div className="wrap">
        <p>
          {sparkle && (
            <>
              <span className="pearl-sparkle-default" aria-hidden="true">
                ✧
              </span>
              <span className="pearl-sparkle-hover" aria-hidden="true">
                ✦
              </span>
            </>
          )}
          <span className="pearl-label-text">{children ?? label}</span>
        </p>
      </div>
    );

    if (href) {
      return (
        <a
          ref={ref as unknown as React.Ref<HTMLAnchorElement>}
          href={href}
          className={combinedClassName}
          aria-disabled={disabled}
          tabIndex={disabled ? -1 : undefined}
          {...(props as unknown as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
        >
          {content}
        </a>
      );
    }

    return (
      <button
        ref={ref as unknown as React.Ref<HTMLButtonElement>}
        type={type}
        disabled={disabled}
        className={combinedClassName}
        {...props}
      >
        {content}
      </button>
    );
  }
);

PearlButton.displayName = "PearlButton";
export default PearlButton;
