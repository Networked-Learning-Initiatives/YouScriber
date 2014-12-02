--create database youscriber;

create table ysuser (
  id SERIAL,
  name varchar(255),
  pwhash varchar(255),
  email varchar(255),
  constraint user_pkey primary key (id)
);

create table video (
  id SERIAL,
  title varchar(255),
  ytid varchar(255),
  owner integer references ysuser (id),
  constraint video_pkey primary key (id)
);

create table comment (
  id SERIAL,
  time real,
  content varchar(255),
  author integer references ysuser(id),
  video_id integer references video(id),
  constraint comment_pkey primary key (id)
);

create table video_thumbnail (
  id SERIAL,
  video_id integer references video(id),
  url varchar(255),
  constraint thumbnail_pkey primary key (id)
);

create table organization (
  id SERIAL, 
  title varchar(255),
  description text,
  constraint org_pkey primary key (id)
);

create table ysgroup (
  id SERIAL,
  title varchar(255),
  owner integer references ysuser(id),
  constraint group_pkey primary key (id)
);

create table group_member (
  id SERIAL,
  ysuser integer references ysuser(id),
  ysgroup integer references ysgroup(id),
  pending boolean,
  constraint gmember_pkey primary key (id)
);

create table organization_member (
  id SERIAL,
  pending boolean,
  ysuser integer references ysuser(id),
  organization integer references organization(id),
  constraint omember_pkey primary key (id)
);

create table permission (
  id SERIAL,
  name varchar(255),
  constraint permission_pkey primary key (id)
);

create table user_privilege (
  id SERIAL,
  ysuser integer references ysuser(id),
  permission integer references permission(id),
  video integer references video (id),
  constraint upriv_pkey primary key (id)
);

create table group_privilege (
  id SERIAL,
  ysgroup integer references ysgroup(id),
  permission integer references permission(id),
  video integer references video (id),
  constraint gpriv_pkey primary key (id)
);

create table organization_privilege (
  id SERIAL,
  organization integer references organization(id),
  permission integer references permission(id),
  video integer references video (id),
  constraint opriv_pkey primary key (id)
);
