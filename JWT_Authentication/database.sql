create extension if not exists "uuid-ossp";

create database jwttutorial;

-- uuid_generate_v4() function is referenced for setting a default value for the user_id column.
create table users(
    user_id uuid primary key default uuid_generate_v4(),
    user_name text not null,
    user_email text not null,
    user_password text not null
);

select * from users;

insert into users(user_name,user_email,user_password) values('Dhwani','dhwani@gmail.com','dhwani');

