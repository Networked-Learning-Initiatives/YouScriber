CREATE DATABASE  IF NOT EXISTS `youscriber` /*!40100 DEFAULT CHARACTER SET utf8 */;
USE `youscriber`;
-- MySQL dump 10.13  Distrib 5.6.13, for osx10.6 (i386)
--
-- Host: 127.0.0.1    Database: youscriber
-- ------------------------------------------------------
-- Server version	5.6.15-debug

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `comment`
--

DROP TABLE IF EXISTS `comment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `comment` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `time` double DEFAULT NULL,
  `content` varchar(255) DEFAULT NULL,
  `author` bigint(20) DEFAULT NULL,
  `video_id` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  KEY `fk_comment_ysuser1_idx` (`author`),
  KEY `fk_comment_video1_idx` (`video_id`),
  CONSTRAINT `fk_comment_video` FOREIGN KEY (`video_id`) REFERENCES `video` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_comment_ysuser1` FOREIGN KEY (`author`) REFERENCES `ysuser` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=56 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comment`
--

LOCK TABLES `comment` WRITE;
/*!40000 ALTER TABLE `comment` DISABLE KEYS */;
INSERT INTO `comment` VALUES (1,13.579,'look at him!',1,1),(2,13.985,'he\'s so small',1,1),(3,14.704,'browse singles ad?!',1,1),(4,8.013,'one of nature\'s smallest primates',1,1),(5,21.721,'cxfxgdf gf ghf hgj hkyui ku gytfg khfryfjuygku ygju gkuyg jhf juyg jfg kug ug kg kug jkg jg jgj gig jyg jyg jyg ufjytf htyf htyf ju',1,1),(6,22.704,'hello',1,1),(7,23.455,'whoa!',1,1),(8,36.983,'long fingers',1,1),(9,37.444,'ew sdjkfsdfhjks dgfhi s',1,1),(10,41.703,'small teddy bear',1,1),(11,55.546,'largest eyes for mammal',1,1),(12,100.70100000000001,'adifuhsdjfhadkuhafk shfk ashf askf askhf kjashf askfh askjfh ajksfhl ashfkj askjfhas kfh adfhjdk gadhlsk gsldkahg lsdhgl dahgl kasdhgkl ashagl dhgl dshgl skhgdfls hdkls fhs dlkgh dlsghs g',1,1),(13,36.983,'long fingers',1,1),(14,37.41,'ajkafhadgfkjasdg ash aklglakhsfglaks glahga lkgahslkga',1,1),(15,41.703,'af',1,1),(16,43.602,'colin oscopy',1,1),(17,49.706,'very large eyes',1,1),(18,17.703,'oh my\nhere\'s a newline in my comment, i wonder if the display will differ\n\n\n\nat all',1,1),(19,5.305,'gm jacques',1,2),(20,26.403,'another one',1,2),(21,76.977,'a very much longer kind of comment because i need to see how much text there is here and so i typed a bunch more and made it much longer and all of that',1,2),(22,155.76899999999998,'i need',1,2),(23,156.451,'several more comments',1,2),(24,158.41899999999998,'in here',1,2),(25,159.301,'so i can check scrollin',1,2),(26,160.75099999999998,'g',1,2),(27,162.69899999999998,'on this thing',1,2),(28,13.185,'hello',1,3),(29,722.698,'little delta',1,NULL),(30,636.342,'ap 5',1,NULL),(31,635.768,'ap 5',1,NULL),(32,636.804,'ap physics 5',1,NULL),(33,635.738,'ap 5',1,3),(34,643.878,'uses no jargon',1,3),(35,646.5770000000001,'as soon as i start tt',1,3),(36,0.323,'a comment for aziz',1,6),(37,2.238,'and yet another one',1,6),(38,6.884,'',1,3),(39,31.74,'oh notice right here that cool thing he did aisdjgsj dkgf',1,3),(40,35.633,'sdjfhsdjfhnzs daskjhdsdkjfsdjk fsduhfsdl fsdjkh sdfjh g',1,3),(41,140.024,'number 8',1,3),(42,140.561,'number9',1,3),(43,140.606,'num10',1,3),(44,140.13,'num11',1,3),(45,148.855,'num12',1,3),(46,0.674,'num3',1,6),(47,144.003,'13',1,3),(48,2.874,'we need a comment for old rube',1,12),(49,3.779,'great',1,15),(50,21.63,'hello',1,15),(51,3.312,'hello',1,15),(52,3.939,'let\'s try this!',1,16),(53,14.132,'another one',1,16),(54,2.447,'hello',1,17),(55,13.318999999999999,'21.9',1,1);
/*!40000 ALTER TABLE `comment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `group_member`
--

DROP TABLE IF EXISTS `group_member`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `group_member` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `ysuser` bigint(20) DEFAULT NULL,
  `ysgroup` bigint(20) DEFAULT NULL,
  `pending` tinyint(4) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  KEY `fk_group_member_ysuser1_idx` (`ysuser`),
  KEY `fk_group_member_ysgroup1_idx` (`ysgroup`),
  CONSTRAINT `fk_group_member_ysgroup1` FOREIGN KEY (`ysgroup`) REFERENCES `ysgroup` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_group_member_ysuser1` FOREIGN KEY (`ysuser`) REFERENCES `ysuser` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `group_member`
--

LOCK TABLES `group_member` WRITE;
/*!40000 ALTER TABLE `group_member` DISABLE KEYS */;
INSERT INTO `group_member` VALUES (1,1,1,NULL);
/*!40000 ALTER TABLE `group_member` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `group_org`
--

DROP TABLE IF EXISTS `group_org`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `group_org` (
  `id` int(11) NOT NULL,
  `group_id` bigint(20) DEFAULT NULL,
  `org_id` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_group_org_ysgroup1_idx` (`group_id`),
  KEY `fk_group_org_organization1_idx` (`org_id`),
  CONSTRAINT `fk_group_org_organization1` FOREIGN KEY (`org_id`) REFERENCES `organization` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_group_org_ysgroup1` FOREIGN KEY (`group_id`) REFERENCES `ysgroup` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `group_org`
--

LOCK TABLES `group_org` WRITE;
/*!40000 ALTER TABLE `group_org` DISABLE KEYS */;
/*!40000 ALTER TABLE `group_org` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `group_privilege`
--

DROP TABLE IF EXISTS `group_privilege`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `group_privilege` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `ysgroup` bigint(20) DEFAULT NULL,
  `permission` bigint(20) DEFAULT NULL,
  `video` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  KEY `fk_group_privilege_video1_idx` (`video`),
  KEY `fk_group_privilege_permission1_idx` (`permission`),
  KEY `fk_group_privilege_ysgroup1_idx` (`ysgroup`),
  CONSTRAINT `fk_group_privilege_permission1` FOREIGN KEY (`permission`) REFERENCES `permission` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_group_privilege_video1` FOREIGN KEY (`video`) REFERENCES `video` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_group_privilege_ysgroup1` FOREIGN KEY (`ysgroup`) REFERENCES `ysgroup` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `group_privilege`
--

LOCK TABLES `group_privilege` WRITE;
/*!40000 ALTER TABLE `group_privilege` DISABLE KEYS */;
INSERT INTO `group_privilege` VALUES (2,1,1,2),(3,1,2,2),(4,1,1,1),(5,1,2,1),(6,1,3,1),(7,1,4,1),(8,1,5,1);
/*!40000 ALTER TABLE `group_privilege` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `organization`
--

DROP TABLE IF EXISTS `organization`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `organization` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) DEFAULT NULL,
  `description` text,
  `owner` bigint(20) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  KEY `fk_organization_ysuser1_idx` (`owner`),
  CONSTRAINT `fk_organization_ysuser1` FOREIGN KEY (`owner`) REFERENCES `ysuser` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `organization`
--

LOCK TABLES `organization` WRITE;
/*!40000 ALTER TABLE `organization` DISABLE KEYS */;
INSERT INTO `organization` VALUES (1,'Virginia Tech',NULL,1),(2,'ysd','ysd',1),(3,'qwe','qwe',1);
/*!40000 ALTER TABLE `organization` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `organization_member`
--

DROP TABLE IF EXISTS `organization_member`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `organization_member` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `pending` tinyint(4) DEFAULT NULL,
  `ysuser` bigint(20) DEFAULT NULL,
  `organization` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  KEY `fk_organization_member_ysuser1_idx` (`ysuser`),
  KEY `fk_organization_member_organization1_idx` (`organization`),
  CONSTRAINT `fk_organization_member_organization1` FOREIGN KEY (`organization`) REFERENCES `organization` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_organization_member_ysuser1` FOREIGN KEY (`ysuser`) REFERENCES `ysuser` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `organization_member`
--

LOCK TABLES `organization_member` WRITE;
/*!40000 ALTER TABLE `organization_member` DISABLE KEYS */;
INSERT INTO `organization_member` VALUES (1,NULL,1,1);
/*!40000 ALTER TABLE `organization_member` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `organization_privilege`
--

DROP TABLE IF EXISTS `organization_privilege`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `organization_privilege` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `organization` bigint(20) DEFAULT NULL,
  `permission` bigint(20) DEFAULT NULL,
  `video` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  KEY `fk_organization_privilege_organization1_idx` (`organization`),
  KEY `fk_organization_privilege_permission1_idx` (`permission`),
  KEY `fk_organization_privilege_video1_idx` (`video`),
  CONSTRAINT `fk_organization_privilege_organization1` FOREIGN KEY (`organization`) REFERENCES `organization` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_organization_privilege_permission1` FOREIGN KEY (`permission`) REFERENCES `permission` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_organization_privilege_video1` FOREIGN KEY (`video`) REFERENCES `video` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `organization_privilege`
--

LOCK TABLES `organization_privilege` WRITE;
/*!40000 ALTER TABLE `organization_privilege` DISABLE KEYS */;
INSERT INTO `organization_privilege` VALUES (6,1,1,1),(7,1,2,1);
/*!40000 ALTER TABLE `organization_privilege` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `permission`
--

DROP TABLE IF EXISTS `permission`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `permission` (
  `id` bigint(20) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `permission`
--

LOCK TABLES `permission` WRITE;
/*!40000 ALTER TABLE `permission` DISABLE KEYS */;
INSERT INTO `permission` VALUES (1,'read'),(2,'author'),(3,'edit'),(4,'delete'),(5,'admin');
/*!40000 ALTER TABLE `permission` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_privilege`
--

DROP TABLE IF EXISTS `user_privilege`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user_privilege` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `ysuser` bigint(20) DEFAULT NULL,
  `permission` bigint(20) DEFAULT NULL,
  `video` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  KEY `fk_user_privilege_ysuser1_idx` (`ysuser`),
  KEY `fk_user_privilege_permission1_idx` (`permission`),
  KEY `fk_user_privilege_video1_idx` (`video`),
  CONSTRAINT `fk_user_privilege_permission1` FOREIGN KEY (`permission`) REFERENCES `permission` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_user_privilege_video1` FOREIGN KEY (`video`) REFERENCES `video` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_user_privilege_ysuser1` FOREIGN KEY (`ysuser`) REFERENCES `ysuser` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_privilege`
--

LOCK TABLES `user_privilege` WRITE;
/*!40000 ALTER TABLE `user_privilege` DISABLE KEYS */;
INSERT INTO `user_privilege` VALUES (1,1,1,1),(2,1,2,1),(4,1,4,1),(5,1,1,2),(6,1,2,2),(8,1,4,2),(9,1,5,1),(11,1,3,2),(12,2,1,1),(13,2,3,1),(14,2,4,1),(15,2,1,1),(16,2,3,1),(17,2,4,1);
/*!40000 ALTER TABLE `user_privilege` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `video`
--

DROP TABLE IF EXISTS `video`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `video` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `ytid` varchar(255) NOT NULL,
  `owner` bigint(20) NOT NULL,
  `thumbnail` varchar(255) NOT NULL,
  `duration` float NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  KEY `fk_video_ysuser_idx` (`owner`),
  CONSTRAINT `fk_video_ysuser1` FOREIGN KEY (`owner`) REFERENCES `ysuser` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `video`
--

LOCK TABLES `video` WRITE;
/*!40000 ALTER TABLE `video` DISABLE KEYS */;
INSERT INTO `video` VALUES (1,'True Facts About The Tarsier','6Jz0JcQYtqo',1,'http://i1.ytimg.com/vi/6Jz0JcQYtqo/mqdefault.jpg',134),(2,'FEZ - PAX East 2011: XBLA Gameplay (2011) | HD','CWUU0vvWLRo',1,'http://i1.ytimg.com/vi/CWUU0vvWLRo/mqdefault.jpg',349),(3,'Confessions of a Converted Lecturer: Eric Mazur','WwslBPj8GgI',1,'http://i.ytimg.com/vi/WwslBPj8GgI/mqdefault.jpg',4808),(6,'Aziz Ansari: Dangerously Delicious - Texting With Girls','WFR4PPxp2z8',1,'http://i.ytimg.com/vi/WFR4PPxp2z8/mqdefault.jpg',86),(12,'OK Go Rube Goldberg Contest SF May 26','rBkY483-o8Q',1,'http://i.ytimg.com/vi/rBkY483-o8Q/mqdefault.jpg',75),(13,'Economics of Cities','nOPlGLxqlww',1,'http://i.ytimg.com/vi/nOPlGLxqlww/mqdefault.jpg',4314),(14,'Economics of Cities','nOPlGLxqlww',1,'http://i.ytimg.com/vi/nOPlGLxqlww/mqdefault.jpg',4314),(15,'John Mulaney - The Salt and Pepper Diner','aYIwPu50Fic',1,'http://i.ytimg.com/vi/aYIwPu50Fic/mqdefault.jpg',375),(16,'Dane Cook - BK Lounge  Burger King','L1IrUAmq4bE',1,'http://i.ytimg.com/vi/L1IrUAmq4bE/mqdefault.jpg',208),(17,'Ickey Shuffle: Did You Know - GEICO','QFrsR9NByc4',1,'http://i.ytimg.com/vi/QFrsR9NByc4/mqdefault.jpg',41);
/*!40000 ALTER TABLE `video` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ysgroup`
--

DROP TABLE IF EXISTS `ysgroup`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ysgroup` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) DEFAULT NULL,
  `owner` bigint(20) DEFAULT NULL,
  `description` text,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  KEY `fk_ysgroup_ysuser1_idx` (`owner`),
  CONSTRAINT `fk_ysgroup_ysuser1` FOREIGN KEY (`owner`) REFERENCES `ysuser` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ysgroup`
--

LOCK TABLES `ysgroup` WRITE;
/*!40000 ALTER TABLE `ysgroup` DISABLE KEYS */;
INSERT INTO `ysgroup` VALUES (1,'Networked Learning Initiatives',1,'a division of TLOS');
/*!40000 ALTER TABLE `ysgroup` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ysuser`
--

DROP TABLE IF EXISTS `ysuser`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ysuser` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `pwhash` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ysuser`
--

LOCK TABLES `ysuser` WRITE;
/*!40000 ALTER TABLE `ysuser` DISABLE KEYS */;
INSERT INTO `ysuser` VALUES (1,'tgm','8e7b3576e667ac62f55d22f7d9fd23ba','tgm@vt.edu'),(2,'chris',NULL,NULL);
/*!40000 ALTER TABLE `ysuser` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2015-02-23 13:41:22
