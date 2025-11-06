import type { Order } from '../types';

/**
 * Mock orders to display in the admin dashboard
 * - admin: sees all orders for a building
 * - user: sees their own orders
 * - guest: sees their own order
 */

export const mockOrders: Order[] = [
    {
        id: 'order-1',
        userId: 'user-1',
        buildingId: 'building-1',
        status: 'placed',
    },

    {
        id: 'order-2',
        userId: 'user-1',
        buildingId: 'building-1',
        status: 'placed',
    },

    {
        id: 'order-3',
        userId: 'user-2',
        buildingId: 'building-1',
        status: 'placed',
    },

    {
        id: 'order-4',
        userId: 'user-3',
        buildingId: 'building-2',
        status: 'placed',
    },

    {
        id: 'order-5',
        userId: 'guest-1',
        buildingId: 'building-2',
        status: 'placed',
    }
];