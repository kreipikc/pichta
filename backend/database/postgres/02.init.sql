LOAD 'age';
SET search_path = ag_catalog, "$user", public;

-- создаём граф
SELECT create_graph('professions_graph');
