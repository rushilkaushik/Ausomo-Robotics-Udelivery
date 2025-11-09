interface LoginProps {
    onLogin: (user: {
        id: string;
        name: string;
        role: "admin" | "user" | "guest";
        buildingId?: string;
        orderIds?: string[];
    }) => void;
}

export default function Login({ onLogin }: LoginProps) {
    return (
        <div>
            <h1>Login</h1>
            <button onClick={() => onLogin({ id: 'admin-1', name: 'Admin User 1', role: 'admin', buildingId: 'building-1', orderIds: [] })}>Login as Admin</button>
            <button onClick={() => onLogin({ id: 'user-1', name: 'John Doe', role: 'user', buildingId: 'building-1', orderIds: ['order-1', 'order-2'] })}>Login as User</button>
            <button onClick={() => onLogin({ id: 'guest-1', name: 'Guest User 1', role: 'guest', buildingId: 'building-2', orderIds: ['order-5'] })}>Login as Guest</button>
        </div>
    );
}