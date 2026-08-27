import { userGradient } from "../../utils/avatarColor";

const SIZES = {
  xs: { box: 24, font: 9 },
  sm: { box: 28, font: 10 },
  md: { box: 36, font: 12.5 },
  lg: { box: 48, font: 15 },
  xl: { box: 64, font: 20 },
};

function initials(firstName = "", lastName = "") {
  return (
    `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase() ||
    "?"
  );
}

function Avatar({
  userId,
  firstName,
  lastName,
  photoUrl,
  size = "md",
  className = "",
  ...rest
}) {
  const { box, font } = SIZES[size] ?? SIZES.md;

  const label = `${firstName ?? ""} ${lastName ?? ""}`.trim();

  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={label}
        title={label}
        className={`rounded-full object-cover shrink-0 shadow-sm ${className}`}
        style={{
          width: box,
          height: box,
        }}
        {...rest}
      />
    );
  }

  return (
    <span
      className={`flex items-center justify-center rounded-full text-white font-semibold shrink-0 shadow-sm ${className}`}
      style={{
        width: box,
        height: box,
        fontSize: font,
        background: userGradient(userId),
      }}
      title={label}
      {...rest}
    >
      {initials(firstName, lastName)}
    </span>
  );
}

export default Avatar;