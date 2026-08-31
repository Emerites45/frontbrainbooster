import Navbar from "./Navbar";

export default function AppLayout({ children, currentUser, onLogout }) {
  return (
    <>
      <Navbar currentUser={currentUser} onLogout={onLogout} />
      {children}
    </>
  );
}