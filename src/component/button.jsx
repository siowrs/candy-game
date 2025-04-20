export default function Button({ type, children, ...props }) {
  return (
    <button type={type} {...props}>
      {children}
    </button>
  );
}
