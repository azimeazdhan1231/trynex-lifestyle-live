import { relations } from "drizzle-orm/relations";
import { orders, userOrders } from "./schema";

export const userOrdersRelations = relations(userOrders, ({one}) => ({
	order: one(orders, {
		fields: [userOrders.orderId],
		references: [orders.id]
	}),
}));

export const ordersRelations = relations(orders, ({many}) => ({
	userOrders: many(userOrders),
}));