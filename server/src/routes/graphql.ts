import { createYoga } from "graphql-yoga";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { typeDefs } from "../graphql/schema.js";
import { queryResolvers } from "../graphql/resolvers/query.js";
import { mutationResolvers } from "../graphql/resolvers/mutation.js";
import { subscriptionResolvers } from "../graphql/resolvers/subscription.js";

const schema = makeExecutableSchema({
  typeDefs,
  resolvers: [queryResolvers, mutationResolvers, subscriptionResolvers],
});

export const yoga = createYoga({
  schema,
  graphqlEndpoint: "/graphql",
  cors: {
    origin: process.env.NODE_ENV === "production" ? false : "http://localhost:5173",
    credentials: true,
  },
});
