export const MOCK_USERS = [
  { id: 1, name: "Marcus Chen", role: "ADMIN" },
  { id: 2, name: "Alex Rivera", role: "SCRUM_MASTER" },
  { id: 3, name: "Sarah Jenkins", role: "MEMBER" },
];

export function getUserName(id) {
  const user = MOCK_USERS.find((u) => u.id === Number(id));
  return user ? user.name : "Non assigné";
}