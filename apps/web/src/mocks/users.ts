import type { User } from '../types';

/**
 * Mock users to login with
 * - admin: sees admin dashboard and all orders for a building
 * - user: sees tracking page and their own orders
 * - guest: sees tracking page and a single order
 */

export const mockUsers: User[] = [
    {
        id: 'admin-1',
        name: 'Admin User 1',
        role: 'admin',
        buildingId: 'building-1',
        orderIds: [],
    },

    {
        id: 'user-1',
        name: 'John Doe',
        role: 'user',
        buildingId: 'building-1',
        orderIds: ['order-1', 'order-2'],
    },

    {
        id: 'user-2',
        name: 'Jane Doe',
        role: 'user',
        buildingId: 'building-1',
        orderIds: ['order-3'],
    },

    {
        id: 'admin-2',
        name: 'Admin User 2',
        role: 'admin',
        buildingId: 'building-2',
        orderIds: [],
    }, 

    {
        id: "user-3",
        name: "John Smith",
        role: 'user',
        buildingId: 'building-2',
        orderIds: ['order-4'],
    },

    {
        id: "guest-1",
        name: "Guest User 1",
        role: 'guest',
        buildingId: 'building-2',
        orderIds: ['order-5'],
    }
    
];