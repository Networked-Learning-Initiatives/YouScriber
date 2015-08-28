insert into permission (id, name) values (1, 'read');
insert into permission (id, name) values (2, 'author');
insert into permission (id, name) values (3, 'edit');
insert into permission (id, name) values (4, 'delete');
insert into permission (id, name) values (5, 'admin');

insert into ysuser (name,pwhash,email) values ('anonymous', '', '');
insert into ysuser (name,pwhash,email) values ('tgm', '8e7b3576e667ac62f55d22f7d9fd23ba', 'tgm@vt.edu');

insert into video values (1,'True Facts About The Tarsier','6Jz0JcQYtqo',1,'http://i1.ytimg.com/vi/6Jz0JcQYtqo/mqdefault.jpg',134),(2,'FEZ - PAX East 2011: XBLA Gameplay (2011) | HD','CWUU0vvWLRo',1,'http://i1.ytimg.com/vi/CWUU0vvWLRo/mqdefault.jpg',349),(3,'Confessions of a Converted Lecturer: Eric Mazur','WwslBPj8GgI',1,'http://i.ytimg.com/vi/WwslBPj8GgI/mqdefault.jpg',4808);

insert into comment (content, time, video_id, author) values('look at him!',13.579, 1, 2);
insert into comment (content, time, video_id, author) values('he''s so small',13.985, 1, 2);
insert into comment (content, time, video_id, author) values('browse singles ad?!',14.704, 1, 2);
insert into comment (content, time, video_id, author) values('one of nature''s smallest primates',8.013, 1, 2);
insert into comment (content, time, video_id, author) values('cxfxgdf gf ghf hgj hkyui ku gytfg khfryfjuygku ygju gkuyg jhf juyg jfg kug ug kg kug jkg jg jgj gig jyg jyg jyg ufjytf htyf htyf ju',21.721, 1, 2);
insert into comment (content, time, video_id, author) values('hello',22.704, 1, 2);
insert into comment (content, time, video_id, author) values('whoa!',23.455, 1, 2);
insert into comment (content, time, video_id, author) values('long fingers',36.983, 1, 2);
insert into comment (content, time, video_id, author) values('ew sdjkfsdfhjks dgfhi s',37.444, 1, 2);
insert into comment (content, time, video_id, author) values('small teddy bear',41.703, 1, 2);
insert into comment (content, time, video_id, author) values('largest eyes for mammal',55.546, 1, 2);
insert into comment (content, time, video_id, author) values('adifuhsdjfhadkuhafk shfk ashf askf askhf kjashf askfh askjfh ajksfhl ashfkj askjfhas kfh adfhjdk gadhlsk gsldkahg lsdhgl dahgl kasdhgkl ashagl dhgl dshgl skhgdfls hdkls fhs dlkgh dlsghs g',100.70100000000001, 1, 2);
insert into comment (content, time, video_id, author) values('long fingers',36.983, 1, 2);
insert into comment (content, time, video_id, author) values('ajkafhadgfkjasdg ash aklglakhsfglaks glahga lkgahslkga',37.41, 1, 2);
insert into comment (content, time, video_id, author) values('af',41.703, 1, 2);
insert into comment (content, time, video_id, author) values('colin oscopy',43.602, 1, 2);
insert into comment (content, time, video_id, author) values('very large eyes',49.706, 1, 2);
insert into comment (content, time, video_id, author) values('oh my\nhere''s a newline in my comment, i wonder if the display will differ\n\n\n\nat all',17.703, 1, 2);

insert into organization (title, owner) values ('Virginia Tech', 1);

insert into ysgroup (title, owner) values ('Networked Learning Initiatives', 2);

insert into group_member (ysuser,ysgroup) values (2,1);

insert into organization_member (ysuser,organization) values (1,1);

insert into user_privilege (ysuser, permission, video) values (2,1,1);
insert into user_privilege (ysuser, permission, video) values (2,2,1);
insert into user_privilege (ysuser, permission, video) values (2,3,1);
insert into user_privilege (ysuser, permission, video) values (2,4,1);

insert into group_privilege (ysgroup, permission, video) values (1,1,1);

insert into comment (content, time, video_id, author) values('gm jacques',5.305, 2, 2);
insert into comment (content, time, video_id, author) values('another one',26.403, 2, 2);
insert into comment (content, time, video_id, author) values('a very much longer kind of comment because i need to see how much text there is here and so i typed a bunch more and made it much longer and all of that',76.977, 2, 2);
insert into comment (content, time, video_id, author) values('i need',155.76899999999998, 2, 2);
insert into comment (content, time, video_id, author) values('several more comments',156.451, 2, 2);
insert into comment (content, time, video_id, author) values('in here',158.41899999999998, 2, 2);
insert into comment (content, time, video_id, author) values('so i can check scrollin',159.301, 2, 2);
insert into comment (content, time, video_id, author) values('g',160.75099999999998, 2, 2);
insert into comment (content, time, video_id, author) values('on this thing',162.69899999999998, 2, 2);

insert into user_privilege (ysuser, permission, video) values (2,1,2);
insert into user_privilege (ysuser, permission, video) values (2,2,2);
insert into user_privilege (ysuser, permission, video) values (2,3,2);
insert into user_privilege (ysuser, permission, video) values (2,4,2);

insert into group_privilege (ysgroup, permission, video) values (1,1,2);
insert into group_privilege (ysgroup, permission, video) values (1,2,2);

insert into comment (content, time, video_id, author) values ('hello',13.185, 3, 1);

insert into user_privilege (ysuser, permission, video) values (2,1,3);
insert into user_privilege (ysuser, permission, video) values (2,2,3);
insert into user_privilege (ysuser, permission, video) values (2,3,3);
insert into user_privilege (ysuser, permission, video) values (2,4,3);

insert into group_privilege (ysgroup, permission, video) values (1,1,3);
insert into group_privilege (ysgroup, permission, video) values (1,2,3);
  