-- MariaDB dump 10.19  Distrib 10.4.22-MariaDB, for Win64 (AMD64)
--
-- Host: db-mysql-ams3-37313-do-user-2119860-0.b.db.ondigitalocean.com    Database: share-a-meal
-- ------------------------------------------------------
-- Server version	8.0.27

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `meal`
--

DROP TABLE IF EXISTS `meal`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `meal` (
  `id` int NOT NULL AUTO_INCREMENT,
  `isActive` tinyint NOT NULL DEFAULT '0',
  `isVega` tinyint NOT NULL DEFAULT '0',
  `isVegan` tinyint NOT NULL DEFAULT '0',
  `isToTakeHome` tinyint NOT NULL DEFAULT '1',
  `dateTime` datetime NOT NULL,
  `maxAmountOfParticipants` int NOT NULL DEFAULT '6',
  `price` decimal(5,2) NOT NULL,
  `imageUrl` varchar(255) NOT NULL,
  `cookId` int DEFAULT NULL,
  `createDate` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updateDate` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `name` varchar(200) NOT NULL,
  `description` varchar(400) NOT NULL,
  `allergenes` set('gluten','lactose','noten') NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  KEY `FK_e325266e1b4188f981a00677580` (`cookId`),
  CONSTRAINT `FK_e325266e1b4188f981a00677580` FOREIGN KEY (`cookId`) REFERENCES `user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `meal`
--


--
-- Table structure for table `meal_participants_user`
--

DROP TABLE IF EXISTS `meal_participants_user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `meal_participants_user` (
  `mealId` int NOT NULL,
  `userId` int NOT NULL,
  PRIMARY KEY (`mealId`,`userId`),
  KEY `IDX_726a90e82859401ab88867dec7` (`mealId`),
  KEY `IDX_6d0a7d816bf85b634a3c6a83ac` (`userId`),
  CONSTRAINT `FK_6d0a7d816bf85b634a3c6a83aca` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_726a90e82859401ab88867dec7f` FOREIGN KEY (`mealId`) REFERENCES `meal` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `meal_participants_user`
--

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user` (
  `id` int NOT NULL AUTO_INCREMENT,
  `firstName` varchar(255) NOT NULL,
  `lastName` varchar(255) NOT NULL,
  `isActive` tinyint NOT NULL DEFAULT '1',
  `emailAdress` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `phoneNumber` varchar(255) DEFAULT '-',
  `roles` set('admin','editor','guest') NOT NULL DEFAULT 'editor,guest',
  `street` varchar(255) NOT NULL,
  `city` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_87877a938268391a71723b303c` (`emailAdress`)
) ENGINE=InnoDB AUTO_INCREMENT=41 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;