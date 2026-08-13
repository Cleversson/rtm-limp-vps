alter table clientes add column recorrencia_meses integer not null default 6;
alter type status_agendamento add value if not exists 'concluido';
