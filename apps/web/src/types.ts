// User type definition
interface User {
    id: string;
    name: string;
    role: "admin" | "user" | "guest";
    buildingId?: string;
    orderIds?: string[]; // Guests will always have one order, account users with multiple orders
    }
export type { User };

interface Order {
    id: string;
    userId?: string; // Account users and guest users
    buildingId: string;
    status: "placed" | "pending" | "delivered";
    }
export type { Order };

interface Robot {
    id: string;
    location: string;
    status: "idle" | "in-transit" | "delivered";
    currentOrderId?: string;
}
export type { Robot };

interface Building {
    id: string;
    name: string;
    orders?: Order[];
    robots?: Robot[];
    users?: User[];
    }
export type { Building };