exports.up = async function (knex) {
  await knex.schema.createTable("users", (table) => {
    table.increments("user_id").primary();
    table.string("username");
    table.string("password");
    table.integer("created_by").defaultTo();
    table.datetime("created_at").defaultTo();
    table.integer("updated_by").defaultTo();
    table.datetime("updated_at").defaultTo();
  });

  await knex("users").insert([
    {
      username: "admin@gmail.com",
      password: "admin@123",
    },
  ]);
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("users");
};
