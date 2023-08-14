exports.up = async function (knex) {
  await knex.schema.createTable("qr_code_users", (table) => {
    table.increments("q_user_id").primary();
    table.text("all_data");
    table.text("unique_code_generate");
    table.enu("is_active", ["Y", "N"]);
    table.integer("created_by").defaultTo();
    table.datetime("created_at").defaultTo();
    table.integer("updated_by").defaultTo();
    table.datetime("updated_at").defaultTo();
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("qr_code_users");
};
