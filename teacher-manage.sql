-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 29, 2025 at 08:26 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `teacher-manage`
--

-- --------------------------------------------------------

--
-- Table structure for table `aptech_exams`
--

CREATE TABLE `aptech_exams` (
  `id` varchar(255) NOT NULL,
  `creation_timestamp` datetime(6) DEFAULT NULL,
  `update_timestamp` datetime(6) DEFAULT NULL,
  `aptech_status` enum('PENDING','APPROVED','REJECTED') DEFAULT NULL,
  `attempt` int(11) NOT NULL,
  `exam_date` date DEFAULT NULL,
  `ocr_extracted_name` varchar(255) DEFAULT NULL,
  `ocr_raw_text` text DEFAULT NULL,
  `ocr_subject_code` varchar(100) DEFAULT NULL,
  `result` enum('PASS','FAIL') DEFAULT NULL,
  `score` int(11) DEFAULT NULL,
  `certificate_file_id` varchar(255) DEFAULT NULL,
  `exam_proof_file_id` varchar(255) DEFAULT NULL,
  `session_id` varchar(255) NOT NULL,
  `subject_id` varchar(255) NOT NULL,
  `teacher_id` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `aptech_exam_sessions`
--

CREATE TABLE `aptech_exam_sessions` (
  `id` varchar(255) NOT NULL,
  `creation_timestamp` datetime(6) DEFAULT NULL,
  `update_timestamp` datetime(6) DEFAULT NULL,
  `exam_date` date NOT NULL,
  `exam_time` time(6) DEFAULT NULL,
  `note` text DEFAULT NULL,
  `room` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `audit_logs`
--

CREATE TABLE `audit_logs` (
  `id` varchar(255) NOT NULL,
  `creation_timestamp` datetime(6) DEFAULT NULL,
  `update_timestamp` datetime(6) DEFAULT NULL,
  `action` varchar(50) DEFAULT NULL,
  `entity` varchar(50) DEFAULT NULL,
  `entity_id` varchar(64) DEFAULT NULL,
  `meta_json` text DEFAULT NULL,
  `actor_user_id` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `audit_logs`
--

INSERT INTO `audit_logs` (`id`, `creation_timestamp`, `update_timestamp`, `action`, `entity`, `entity_id`, `meta_json`, `actor_user_id`) VALUES
('170649d2-b10c-4680-8656-8d1199e652e5', '2025-11-29 19:36:44.000000', '2025-11-29 19:36:44.000000', 'LOGIN', 'USER', '2', '{\"method\":\"GOOGLE\"}', '2'),
('4759f614-f23c-4fac-bc3a-70845f01d7f3', '2025-11-29 22:02:55.000000', '2025-11-29 22:02:55.000000', 'LOGIN', 'USER', '1', '{\"method\":\"GOOGLE\"}', '1'),
('7acf25b4-3a96-4f5c-a33d-5182d025186b', '2025-11-30 02:08:25.000000', '2025-11-30 02:08:25.000000', 'LOGIN', 'USER', '1', '{\"method\":\"GOOGLE\"}', '1'),
('828b3b67-1dfa-4321-b91f-f775c1f1a260', '2025-11-30 02:06:19.000000', '2025-11-30 02:06:19.000000', 'LOGIN', 'USER', '2', '{\"method\":\"GOOGLE\"}', '2'),
('8b0878e9-7cf2-43d4-adec-7e7e9da5a4ec', '2025-11-30 01:24:58.000000', '2025-11-30 01:24:58.000000', 'LOGIN', 'USER', '1', '{\"method\":\"GOOGLE\"}', '1'),
('b590b7f9-77f2-4cd7-9464-0259d2f963c7', '2025-11-29 21:35:34.000000', '2025-11-29 21:35:34.000000', 'LOGIN', 'USER', '1', '{\"method\":\"GOOGLE\"}', '1'),
('b99f8e13-1de8-4b83-93a4-86907e9969c2', '2025-11-29 21:31:09.000000', '2025-11-29 21:31:09.000000', 'LOGIN', 'USER', '2', '{\"method\":\"GOOGLE\"}', '2'),
('bf6f969b-e463-4aaf-b502-ccb1e499f9f1', '2025-11-29 18:58:37.000000', '2025-11-29 18:58:37.000000', 'LOGIN', 'USER', '2', '{\"method\":\"GOOGLE\"}', '2'),
('df14d44b-a700-455b-be64-278152166371', '2025-11-30 01:16:49.000000', '2025-11-30 01:16:49.000000', 'LOGIN', 'USER', 'e785b8b6-a1bf-4ec8-98fd-b343e1eeb5c8', '{\"method\":\"PASSWORD\"}', 'e785b8b6-a1bf-4ec8-98fd-b343e1eeb5c8');

-- --------------------------------------------------------

--
-- Table structure for table `evidence`
--

CREATE TABLE `evidence` (
  `id` varchar(255) NOT NULL,
  `creation_timestamp` datetime(6) DEFAULT NULL,
  `update_timestamp` datetime(6) DEFAULT NULL,
  `ocr_evaluator` varchar(100) DEFAULT NULL,
  `ocr_full_name` varchar(100) DEFAULT NULL,
  `ocr_result` enum('PASS','FAIL') DEFAULT NULL,
  `ocr_text` text DEFAULT NULL,
  `status` enum('PENDING','VERIFIED','REJECTED') NOT NULL,
  `submitted_date` date DEFAULT NULL,
  `verified_at` datetime(6) DEFAULT NULL,
  `file_id` varchar(255) DEFAULT NULL,
  `subject_id` varchar(255) NOT NULL,
  `teacher_id` varchar(255) NOT NULL,
  `verified_by` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `files`
--

CREATE TABLE `files` (
  `id` varchar(255) NOT NULL,
  `creation_timestamp` datetime(6) DEFAULT NULL,
  `update_timestamp` datetime(6) DEFAULT NULL,
  `checksum` varchar(128) DEFAULT NULL,
  `file_name` varchar(255) DEFAULT NULL,
  `file_path` varchar(255) DEFAULT NULL,
  `original_file_name` varchar(255) DEFAULT NULL,
  `size_bytes` bigint(20) DEFAULT NULL,
  `type` varchar(100) DEFAULT NULL,
  `uploaded_by` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` varchar(255) NOT NULL,
  `creation_timestamp` datetime(6) DEFAULT NULL,
  `update_timestamp` datetime(6) DEFAULT NULL,
  `message` text DEFAULT NULL,
  `is_read` bit(1) NOT NULL,
  `related_entity` varchar(50) DEFAULT NULL,
  `related_id` varchar(64) DEFAULT NULL,
  `title` varchar(150) NOT NULL,
  `type` enum('ADMIN_NOTIFICATION','MANAGER_NOTIFICATION','SYSTEM_NOTIFICATION','SUBJECT_NOTIFICATION','ASSIGNMENT_NOTIFICATION','TRIAL_NOTIFICATION','EVIDENCE_NOTIFICATION','REPORT_NOTIFICATION','GENERAL_NOTIFICATION') DEFAULT NULL,
  `user_id` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`id`, `creation_timestamp`, `update_timestamp`, `message`, `is_read`, `related_entity`, `related_id`, `title`, `type`, `user_id`) VALUES
('22103150-79d5-4a3d-8d53-ec4e5778ab5e', '2025-11-30 01:17:24.000000', '2025-11-30 01:17:24.000000', 'Đăng ký môn Data Management with SQL Server đã được cập nhật.', b'0', 'SubjectRegistration', '1e9d9fb8-f793-4066-a040-ce77163c13cc', 'Cập nhật đăng ký', 'SUBJECT_NOTIFICATION', '2'),
('8260ab04-2648-4230-9d84-653294f8a71d', '2025-11-30 01:17:21.000000', '2025-11-30 01:17:21.000000', 'Đăng ký môn Bootstrap đã được cập nhật.', b'0', 'SubjectRegistration', '0be7eb7b-3457-428f-9ddb-2acb43d8484e', 'Cập nhật đăng ký', 'SUBJECT_NOTIFICATION', 'e785b8b6-a1bf-4ec8-98fd-b343e1eeb5c8'),
('bfa517c7-0e77-4700-a0b0-050e7f6f949e', '2025-11-30 01:17:23.000000', '2025-11-30 01:17:23.000000', 'Đăng ký môn eProject-Responsive Web Development đã được cập nhật.', b'0', 'SubjectRegistration', '2dac5b1e-9e5f-40fd-8a1d-0b298d071269', 'Cập nhật đăng ký', 'SUBJECT_NOTIFICATION', '2'),
('c1a5247b-181d-4000-aec7-adcc36a56315', '2025-11-30 01:17:22.000000', '2025-11-30 01:17:22.000000', 'Đăng ký môn Data Processing with XML and JSON đã được cập nhật.', b'0', 'SubjectRegistration', 'e29e65ec-0ea2-492b-8c6d-3ac098e43bb4', 'Cập nhật đăng ký', 'SUBJECT_NOTIFICATION', '2'),
('ee77efaf-d695-4d45-8432-7f2adde17916', '2025-11-30 01:17:23.000000', '2025-11-30 01:17:23.000000', 'Đăng ký môn UI/UX for Responsive Web Design đã được cập nhật.', b'0', 'SubjectRegistration', '3ae7c7ff-aa1a-43e1-a2dc-408fa1037abe', 'Cập nhật đăng ký', 'SUBJECT_NOTIFICATION', '2');

-- --------------------------------------------------------

--
-- Table structure for table `reports`
--

CREATE TABLE `reports` (
  `id` varchar(255) NOT NULL,
  `creation_timestamp` datetime(6) DEFAULT NULL,
  `update_timestamp` datetime(6) DEFAULT NULL,
  `params_json` text DEFAULT NULL,
  `quarter` int(11) DEFAULT NULL,
  `report_type` varchar(30) NOT NULL,
  `status` varchar(20) DEFAULT NULL,
  `year` int(11) DEFAULT NULL,
  `file_id` varchar(255) DEFAULT NULL,
  `generated_by` varchar(255) DEFAULT NULL,
  `teacher_id` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `schedule_classes`
--

CREATE TABLE `schedule_classes` (
  `id` varchar(255) NOT NULL,
  `creation_timestamp` datetime(6) DEFAULT NULL,
  `update_timestamp` datetime(6) DEFAULT NULL,
  `class_code` varchar(50) NOT NULL,
  `location` varchar(100) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `quarter` enum('QUY1','QUY2','QUY3','QUY4') NOT NULL,
  `year` int(11) NOT NULL,
  `subject_id` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `schedule_slots`
--

CREATE TABLE `schedule_slots` (
  `id` varchar(255) NOT NULL,
  `creation_timestamp` datetime(6) DEFAULT NULL,
  `update_timestamp` datetime(6) DEFAULT NULL,
  `day_of_week` enum('MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY') NOT NULL,
  `end_time` time(6) NOT NULL,
  `start_time` time(6) NOT NULL,
  `schedule_class_id` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `skills`
--

CREATE TABLE `skills` (
  `id` varchar(255) NOT NULL,
  `creation_timestamp` datetime(6) DEFAULT NULL,
  `update_timestamp` datetime(6) DEFAULT NULL,
  `is_active` bit(1) NOT NULL,
  `skill_code` varchar(50) NOT NULL,
  `skill_name` varchar(500) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `skills`
--

INSERT INTO `skills` (`id`, `creation_timestamp`, `update_timestamp`, `is_active`, `skill_code`, `skill_name`) VALUES
('01ab4ac9-182d-43f4-a367-e332530c9ce7', '2025-11-29 17:51:25.000000', '2025-11-29 17:51:25.000000', b'1', '1525', '1525-Nuke 13'),
('0272e742-992d-4251-bb42-2578791601a0', '2025-11-29 17:51:25.000000', '2025-11-29 17:51:25.000000', b'1', '276', '276-Storyboarding'),
('0340ebf9-423b-4ee5-9472-ced783156e10', '2025-11-29 17:52:13.000000', '2025-11-29 17:52:13.000000', b'1', '20', '1212'),
('03b2d436-23cf-46ae-9fb5-a93bc7bbf3d6', '2025-11-29 17:51:25.000000', '2025-11-29 17:51:25.000000', b'1', '1523', '1523-Adobe Prmier Pro CC 2021'),
('04e6ddbe-81dc-4954-85f6-e907e68ccb1e', '2025-11-29 17:51:08.000000', '2025-11-29 17:51:08.000000', b'1', '399', '399-MongoDB & Cassandra'),
('070d3033-55c5-4411-8352-f1da0a36acc0', '2025-11-29 17:51:25.000000', '2025-11-29 17:51:25.000000', b'1', '1532', '1532-Modeling and Texturing (MAYA Unlimited 2022)'),
('1319dd40-4154-4edb-a1b5-e869cd042b70', '2025-11-29 17:51:12.000000', '2025-11-29 17:51:12.000000', b'1', '17', '17-XML'),
('203e4b5a-b679-4209-a0dd-f8eae47078ff', '2025-11-29 17:51:25.000000', '2025-11-29 17:51:25.000000', b'1', '1512', '1512-Substance Designer and Painter'),
('21b5e4ae-c0b5-4c91-b7f4-bce9b21a4439', '2025-11-29 17:51:08.000000', '2025-11-29 17:51:08.000000', b'1', '1258', '1258-Python (3.6)'),
('270d3e8e-171c-4d10-afe8-03d064f240cb', '2025-11-29 17:51:12.000000', '2025-11-29 17:51:12.000000', b'1', '125', '125-Cloud Computing'),
('2908068d-a7f2-413a-a014-6bba769e4307', '2025-11-29 17:51:11.000000', '2025-11-29 17:51:11.000000', b'1', '75', '75-Logic Building with C'),
('2bde1389-7741-4e99-a5b3-970cde1f98df', '2025-11-29 17:51:11.000000', '2025-11-29 17:51:11.000000', b'1', '177', '177-HTML5'),
('2c2f5aa6-c105-4d65-a6ec-11c2628c8f10', '2025-11-29 17:51:25.000000', '2025-11-29 17:51:25.000000', b'1', '1524', '1524-Adobe After Effects CC 2021'),
('365f4e30-2275-412e-abae-6cd8b85f5c6d', '2025-11-29 17:51:08.000000', '2025-11-29 17:51:08.000000', b'1', '1262', 'R Programming'),
('3e63f9cf-7e50-43f3-8a58-670f70226984', '2025-11-29 17:51:08.000000', '2025-11-29 17:51:08.000000', b'1', '1291', '1291-SQL Server 2019'),
('3f6dcfdf-11f6-4bbe-9921-80f442c5f5b4', '2025-11-29 17:51:25.000000', '2025-11-29 17:51:25.000000', b'1', '1514', '1514-Blender'),
('496e6f2a-d270-4936-8a79-1a818b6e43b2', '2025-11-29 17:51:16.000000', '2025-11-29 17:51:16.000000', b'1', '1300', '1300-Django Python Framework'),
('49b4e5cf-4b2b-4fd5-aa43-6c45d6f9d835', '2025-11-29 17:51:11.000000', '2025-11-29 17:51:11.000000', b'1', '368', '368-UI/UX for Responsive Design'),
('4f5f490c-61dd-4f25-9af7-9ffe5ba63731', '2025-11-29 17:52:13.000000', '2025-11-29 17:52:13.000000', b'1', '24', '367'),
('4f86a82b-dc99-45c0-bd4b-4b5b1af00506', '2025-11-29 17:51:24.000000', '2025-11-29 17:51:24.000000', b'1', '1520', '1520-Adobe Lightroom CC 2021'),
('4f9677b6-558b-42a8-8581-f8a5b217e198', '2025-11-29 17:51:25.000000', '2025-11-29 17:51:25.000000', b'1', '259', '259-HTML AND CSS'),
('54d19017-e49e-4630-8d47-c8f4efa4d57c', '2025-11-29 17:51:12.000000', '2025-11-29 17:51:12.000000', b'1', '1274', '1274-PHP (v7)'),
('56ecb65f-a0af-4086-9034-f203e06ab343', '2025-11-29 17:51:25.000000', '2025-11-29 17:51:25.000000', b'1', '1510', '1510-UI'),
('59ec1868-1267-4cad-a9be-964b9d81b4c9', '2025-11-29 17:51:25.000000', '2025-11-29 17:51:25.000000', b'1', '278', '278-Digital Pre-Production'),
('5ad6978f-5416-4e9b-91d8-ae2f5cbb25a3', '2025-11-29 17:51:25.000000', '2025-11-29 17:51:25.000000', b'1', '1533', '1533-Lighting and Rendering (MAYA Unlimited 2022)'),
('5afb3214-76f4-404e-98ae-d0f08c433892', '2025-11-29 17:51:16.000000', '2025-11-29 17:51:16.000000', b'1', '1359', '1359-SQL Server 2022'),
('5e2bb0f0-6770-44ac-8921-d3e6284478d5', '2025-11-29 17:51:25.000000', '2025-11-29 17:51:25.000000', b'1', '1537', '1537-Advanced Character Animation (MAYA Unlimited 2021)'),
('66bc8ce1-3033-445e-9945-d8e229ce4962', '2025-11-29 17:51:25.000000', '2025-11-29 17:51:25.000000', b'1', '209', '209-After Effects'),
('67c3a030-1651-4d4b-ae71-094c0a186e17', '2025-11-29 17:51:25.000000', '2025-11-29 17:51:25.000000', b'1', '213', '213-Dream Weaver / HTML'),
('68ffdf62-8e47-4e14-9924-89051c18e25a', '2025-11-29 17:51:08.000000', '2025-11-29 17:51:08.000000', b'1', '1356', '1356-Inferential Statistical Analysis'),
('6e6d9654-19ae-4f58-a46e-630c8dfc1ec3', '2025-11-29 17:51:25.000000', '2025-11-29 17:51:25.000000', b'1', '1544', '1544-Adobe Dreamweaver CC'),
('6ed26342-f6d8-4b32-b01e-6464cad9c0d9', '2025-11-29 17:51:12.000000', '2025-11-29 17:51:12.000000', b'1', '1340', '1340-ASP.NET CORE MVC (VS 2022)'),
('71a8af0e-6a34-46e3-b23c-c6620f15dcda', '2025-11-29 17:52:13.000000', '2025-11-29 17:52:13.000000', b'1', '16', '366'),
('758658b0-291e-4b25-8dc7-c5a056d486aa', '2025-11-29 17:51:25.000000', '2025-11-29 17:51:25.000000', b'1', '281', '281-Unity'),
('75cd8fab-6b61-44ec-a13e-e433a84650d2', '2025-11-29 17:52:13.000000', '2025-11-29 17:52:13.000000', b'1', '40', '329'),
('7c2f2b06-7478-42de-972a-e15ce3f4a707', '2025-11-29 17:51:12.000000', '2025-11-29 17:51:12.000000', b'1', '1306', '1306-Dart Programming'),
('7d8c6eea-74d3-4c63-8e4e-3741528e9b05', '2025-11-29 17:51:08.000000', '2025-11-29 17:51:08.000000', b'1', '1296', '1296-MS Office 2019'),
('8739d39d-11b2-4730-ae25-2b201881dc56', '2025-11-29 17:51:12.000000', '2025-11-29 17:51:12.000000', b'1', '396', '396-Node.js'),
('87f25424-97d7-4f6a-8a85-ba92e68828e3', '2025-11-29 17:51:12.000000', '2025-11-29 17:51:12.000000', b'1', '1339', '1339-Programming in C# (VS 2022)'),
('88441b9d-6b76-4807-8fcd-dfa1883f8a67', '2025-11-29 17:51:25.000000', '2025-11-29 17:51:25.000000', b'1', '279', '279-UI and UX for Responsive Web Design'),
('8bedf249-4959-4fea-a4df-292149876b41', '2025-11-29 17:52:13.000000', '2025-11-29 17:52:13.000000', b'1', '22', '352'),
('921f504e-7cf6-4b45-a749-82ec7b971edb', '2025-11-29 17:51:25.000000', '2025-11-29 17:51:25.000000', b'1', '1522', '1522-Adobe Audition CC 2021'),
('93bba4d5-0738-4e43-b33a-dbed9b4ea4e0', '2025-11-29 17:51:24.000000', '2025-11-29 17:51:24.000000', b'1', '1519', '1519-Adobe Photoshop CC 2021'),
('96649d3b-aad5-4015-846e-ccaccd2b7cb5', '2025-11-29 17:51:12.000000', '2025-11-29 17:51:12.000000', b'1', '1341', '1341-Windows Azure Solutions (VS 2022)'),
('97d50f64-1490-495d-9d8e-a011e8913d95', '2025-11-29 17:51:24.000000', '2025-11-29 17:51:24.000000', b'1', '1521', '1521-Adobe Indesign CC 2021 & Adobe Incopy CC 2021'),
('9835cda4-2b60-413b-af39-36de52c337e2', '2025-11-29 17:51:12.000000', '2025-11-29 17:51:12.000000', b'1', '1307', '1307-Flutter and Dart'),
('a1a3854d-b0e0-45b0-b77e-d304026898f1', '2025-11-29 17:51:11.000000', '2025-11-29 17:51:11.000000', b'1', '1337', '1337- ReactJS'),
('a6db46ab-404f-40b9-bece-e55619cee8ca', '2025-11-29 17:51:12.000000', '2025-11-29 17:51:12.000000', b'1', '1342', '1342-Jakarta EE Platform 10 (Servlets-JSP-EJB)'),
('a81b5138-7198-4b1f-875e-82f817c7f1e4', '2025-11-29 17:52:13.000000', '2025-11-29 17:52:13.000000', b'1', '36', '362'),
('ad8a13e4-9159-44c2-b558-eb0d1d48c952', '2025-11-29 17:51:12.000000', '2025-11-29 17:51:12.000000', b'1', '1343', '1343-Spring and Spring Boot'),
('b63ea55d-4233-43fb-aa67-914d585eb34f', '2025-11-29 17:51:24.000000', '2025-11-29 17:51:24.000000', b'1', '1517', '1517-Adobe Illustrator CC 2021'),
('b9ffd8c2-fc58-43e5-aeea-2ddaef8d05d8', '2025-11-29 17:51:12.000000', '2025-11-29 17:51:12.000000', b'1', '1338', '1338-Core and Advanced Java 19.x'),
('c4a7f472-1493-4f27-b912-ba8ad373ed06', '2025-11-29 17:51:25.000000', '2025-11-29 17:51:25.000000', b'1', '1529', '1529-Adobe Animate CC 2021'),
('c5a0c93b-27a2-401f-b48e-6d30faa8ac1d', '2025-11-29 17:51:24.000000', '2025-11-29 17:51:24.000000', b'1', '202', '202-Photoshop & COG'),
('d3ab4747-d947-4133-b5b3-2e55dd5ebb4f', '2025-11-29 17:51:25.000000', '2025-11-29 17:51:25.000000', b'1', '280', '280-Game Visualization, Development Essentials'),
('df8d7b0e-e50d-4a42-864c-cb674c68f633', '2025-11-29 17:51:24.000000', '2025-11-29 17:51:24.000000', b'1', '233', '233-Typography & Printing'),
('e056d7f5-7cae-48f7-8328-b96ee29368ba', '2025-11-29 17:52:13.000000', '2025-11-29 17:52:13.000000', b'1', '32', '321'),
('e6bfb1b5-7811-4166-8efc-f386163591b2', '2025-11-29 17:51:16.000000', '2025-11-29 17:51:16.000000', b'1', '1273', '1273-Version Control (Git)'),
('edc5b6d1-a2ae-4099-a9bd-48333222a2dc', '2025-11-29 17:51:24.000000', '2025-11-29 17:51:24.000000', b'1', '203', '203-MediaPublishing-PageMaker,QuarkExp & CDA'),
('eed10ead-4eee-46d8-bbba-558e7af5c9d9', '2025-11-29 17:51:25.000000', '2025-11-29 17:51:25.000000', b'1', '1545', '1545-Bootstrap 5'),
('f5316c60-d10a-4475-bca2-0e75767a269f', '2025-11-29 17:51:16.000000', '2025-11-29 17:51:16.000000', b'1', '1367', '1367-PHP (v8.x) with Laravel'),
('f93d1c1b-ce60-4444-9ad4-f1f0f3f7db8a', '2025-11-29 17:51:25.000000', '2025-11-29 17:51:25.000000', b'1', '1534', '1534-Rigging and Animation (MAYA Unlimited 2022)');

-- --------------------------------------------------------

--
-- Table structure for table `subjects`
--

CREATE TABLE `subjects` (
  `id` varchar(255) NOT NULL,
  `creation_timestamp` datetime(6) DEFAULT NULL,
  `update_timestamp` datetime(6) DEFAULT NULL,
  `hours` int(11) DEFAULT NULL,
  `is_active` bit(1) NOT NULL,
  `is_new_subject` bit(1) DEFAULT NULL,
  `semester` enum('SEMESTER_1','SEMESTER_2','SEMESTER_3','SEMESTER_4') DEFAULT NULL,
  `subject_name` varchar(200) DEFAULT NULL,
  `image_subject` varchar(255) DEFAULT NULL,
  `skill_id` varchar(255) DEFAULT NULL,
  `system_id` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `subjects`
--

INSERT INTO `subjects` (`id`, `creation_timestamp`, `update_timestamp`, `hours`, `is_active`, `is_new_subject`, `semester`, `subject_name`, `image_subject`, `skill_id`, `system_id`) VALUES
('05756982-46a1-4bbc-8055-a3321aeed64b', '2025-11-29 17:51:25.000000', '2025-11-29 17:51:25.000000', NULL, b'1', b'0', 'SEMESTER_2', 'Bootstrap', NULL, 'eed10ead-4eee-46d8-bbba-558e7af5c9d9', '7d0458fd-dc6c-4d4c-835c-f0a7fe16f30a'),
('085f6318-fb58-40e3-8dc3-8988c834ff11', '2025-11-29 17:51:25.000000', '2025-11-29 17:51:25.000000', NULL, b'1', b'0', 'SEMESTER_4', 'Lighting and Rendering 3D Objects with Maya', NULL, '5ad6978f-5416-4e9b-91d8-ae2f5cbb25a3', '7d0458fd-dc6c-4d4c-835c-f0a7fe16f30a'),
('09073000-ce2b-4cd1-99d2-35e9663ab8e4', '2025-11-29 17:51:16.000000', '2025-11-29 17:51:16.000000', NULL, b'1', b'0', 'SEMESTER_1', 'eProject - Laravel and PHP Application Development +\nWeb Design for Responsive Development', NULL, 'f5316c60-d10a-4475-bca2-0e75767a269f', '5091d08f-e035-437b-aa31-a6d8b0645f54'),
('0b0e2371-548f-4bbb-9b91-a39771938469', '2025-11-29 17:51:25.000000', '2025-11-29 17:51:25.000000', NULL, b'1', b'0', 'SEMESTER_3', 'Concepts of Digital Film Making', NULL, '66bc8ce1-3033-445e-9945-d8e229ce4962', '7d0458fd-dc6c-4d4c-835c-f0a7fe16f30a'),
('0e885ab3-7a31-405a-8dc8-8d75e6b3039e', '2025-11-29 17:51:16.000000', '2025-11-29 17:51:16.000000', NULL, b'1', b'0', 'SEMESTER_2', 'Data Processing with XML and JSON', NULL, '1319dd40-4154-4edb-a1b5-e869cd042b70', '5091d08f-e035-437b-aa31-a6d8b0645f54'),
('0ef959a9-fef1-4207-83f3-bd1744f1009d', '2025-11-29 17:51:11.000000', '2025-11-29 17:51:11.000000', NULL, b'1', b'0', 'SEMESTER_1', 'eProject-Responsive Web Development', NULL, '2bde1389-7741-4e99-a5b3-970cde1f98df', '21fcf033-5dbf-4beb-987c-8b74bfca091d'),
('1055a95e-976f-441a-9716-d887f8fe7bd4', '2025-11-29 17:51:12.000000', '2025-11-29 17:51:12.000000', NULL, b'1', b'0', 'SEMESTER_2', 'Data Processing with XML and JSON', NULL, '1319dd40-4154-4edb-a1b5-e869cd042b70', '21fcf033-5dbf-4beb-987c-8b74bfca091d'),
('1152fa39-8e11-4856-8166-fd041cd7eacc', '2025-11-29 17:51:25.000000', '2025-11-29 17:51:25.000000', NULL, b'1', b'0', 'SEMESTER_4', 'Portfolio development with Demo Reel (eProject)', NULL, 'f93d1c1b-ce60-4444-9ad4-f1f0f3f7db8a', '7d0458fd-dc6c-4d4c-835c-f0a7fe16f30a'),
('12cfa8ea-b588-4ef0-850c-f7ee1cd3b67e', '2025-11-29 17:51:24.000000', '2025-11-29 17:51:24.000000', NULL, b'1', b'0', 'SEMESTER_1', 'Lightroom for Photographers', NULL, '4f86a82b-dc99-45c0-bd4b-4b5b1af00506', '7d0458fd-dc6c-4d4c-835c-f0a7fe16f30a'),
('1340c1ef-80b8-4d58-91ea-b829f037839f', '2025-11-29 17:51:12.000000', '2025-11-29 17:51:12.000000', NULL, b'1', b'0', 'SEMESTER_4', 'Project-Java Enterprise Application Development', NULL, 'a6db46ab-404f-40b9-bece-e55619cee8ca', '21fcf033-5dbf-4beb-987c-8b74bfca091d'),
('17040c1e-3cf6-448f-bca8-8941ee69b785', '2025-11-29 17:51:16.000000', '2025-11-29 17:51:16.000000', NULL, b'1', b'0', 'SEMESTER_1', 'Managing Data with SQL Server', NULL, '5afb3214-76f4-404e-98ae-d0f08c433892', '5091d08f-e035-437b-aa31-a6d8b0645f54'),
('17e0c7de-dd7f-4171-a8cf-989d5872e7aa', '2025-11-29 17:51:12.000000', '2025-11-29 17:51:12.000000', NULL, b'1', b'0', 'SEMESTER_3', 'Developing Microsoft Azure Solutions', NULL, '96649d3b-aad5-4015-846e-ccaccd2b7cb5', '21fcf033-5dbf-4beb-987c-8b74bfca091d'),
('19ce87bb-00ac-46eb-9ec8-f23d4921af58', '2025-11-29 17:51:12.000000', '2025-11-29 17:51:12.000000', NULL, b'1', b'0', 'SEMESTER_4', 'Enterprise Application Development in Jakarta EE', NULL, 'a6db46ab-404f-40b9-bece-e55619cee8ca', '21fcf033-5dbf-4beb-987c-8b74bfca091d'),
('19d27a02-6561-47aa-a66b-00f7a5bd9721', '2025-11-29 17:51:11.000000', '2025-11-29 17:51:11.000000', NULL, b'1', b'0', 'SEMESTER_1', 'Frontend Web Development with React', NULL, 'a1a3854d-b0e0-45b0-b77e-d304026898f1', '21fcf033-5dbf-4beb-987c-8b74bfca091d'),
('21301704-9dd7-46a7-8788-d5fbaaf2ae35', '2025-11-29 17:51:12.000000', '2025-11-29 17:51:12.000000', NULL, b'1', b'0', 'SEMESTER_4', 'Web Component Development using Jakarta EE', NULL, 'a6db46ab-404f-40b9-bece-e55619cee8ca', '21fcf033-5dbf-4beb-987c-8b74bfca091d'),
('23458a2d-4f72-4dbf-a801-5d7e75333bc7', '2025-11-29 17:51:12.000000', '2025-11-29 17:51:12.000000', NULL, b'1', b'0', 'SEMESTER_3', 'Essentials of NodeJS', NULL, '8739d39d-11b2-4730-ae25-2b201881dc56', '21fcf033-5dbf-4beb-987c-8b74bfca091d'),
('247b7dc1-fda3-44df-aa56-1edc2f2c802b', '2025-11-29 17:51:16.000000', '2025-11-29 17:51:16.000000', NULL, b'1', b'0', 'SEMESTER_1', 'React for Modern Web Development', NULL, 'a1a3854d-b0e0-45b0-b77e-d304026898f1', '5091d08f-e035-437b-aa31-a6d8b0645f54'),
('28b31050-2d6b-491b-b4c4-348b8d1a2a99', '2025-11-29 17:51:16.000000', '2025-11-29 17:51:16.000000', NULL, b'1', b'0', 'SEMESTER_3', 'Generative AI for .NET Developers with Google AI', NULL, NULL, '5091d08f-e035-437b-aa31-a6d8b0645f54'),
('2ab4ac69-7f6c-43eb-9bd7-6e1d147e75cc', '2025-11-29 17:51:08.000000', '2025-11-29 17:51:08.000000', NULL, b'1', b'0', 'SEMESTER_1', 'Data Science using R Programming', NULL, '365f4e30-2275-412e-abae-6cd8b85f5c6d', '08667b11-fe06-4187-a624-d2e9e9efa06b'),
('2b225a92-603d-4356-8ace-a80b77b13647', '2025-11-29 17:51:25.000000', '2025-11-29 17:51:25.000000', NULL, b'1', b'0', 'SEMESTER_3', 'Level Designing', NULL, '758658b0-291e-4b25-8dc7-c5a056d486aa', '7d0458fd-dc6c-4d4c-835c-f0a7fe16f30a'),
('2e7c1f55-fef2-49f5-9b20-232e9bce6644', '2025-11-29 17:51:25.000000', '2025-11-29 17:51:25.000000', NULL, b'1', b'0', 'SEMESTER_4', 'Digital Compositing', NULL, '01ab4ac9-182d-43f4-a367-e332530c9ce7', '7d0458fd-dc6c-4d4c-835c-f0a7fe16f30a'),
('2f58bcce-1ff4-49a7-aa7a-68a82ecdf7f0', '2025-11-29 17:52:13.000000', '2025-11-29 17:52:13.000000', NULL, b'1', b'0', 'SEMESTER_1', 'Routing Technology', NULL, 'e056d7f5-7cae-48f7-8328-b96ee29368ba', 'b3b62020-6d61-4613-8ce3-fff0e0d3c6bb'),
('30f27eaf-b71c-4f0e-81bb-ce18d2a8052d', '2025-11-29 17:51:12.000000', '2025-11-29 17:51:12.000000', NULL, b'1', b'0', 'SEMESTER_3', 'Emergingjob Areas-SMAC', NULL, '270d3e8e-171c-4d10-afe8-03d064f240cb', '21fcf033-5dbf-4beb-987c-8b74bfca091d'),
('33bb4ad0-f386-4060-95a7-cbecddc71b85', '2025-11-29 17:51:11.000000', '2025-11-29 17:51:11.000000', NULL, b'1', b'0', 'SEMESTER_1', 'Data Management with SQL Server', NULL, '3e63f9cf-7e50-43f3-8a58-670f70226984', '21fcf033-5dbf-4beb-987c-8b74bfca091d'),
('34fa45d4-8c52-4719-9085-d2e52e4e24c4', '2025-11-29 17:51:25.000000', '2025-11-29 17:51:25.000000', NULL, b'1', b'0', 'SEMESTER_3', 'Retopology of Game Asset', NULL, '3f6dcfdf-11f6-4bbe-9921-80f442c5f5b4', '7d0458fd-dc6c-4d4c-835c-f0a7fe16f30a'),
('352bc806-b106-4445-bd93-43beae080cd4', '2025-11-29 17:52:13.000000', '2025-11-29 17:52:13.000000', NULL, b'1', b'0', 'SEMESTER_1', 'Introduction to Ethical Hacking', NULL, '75cd8fab-6b61-44ec-a13e-e433a84650d2', 'b3b62020-6d61-4613-8ce3-fff0e0d3c6bb'),
('35d9629c-4dd3-4aa7-b418-ea78a7ee3674', '2025-11-29 17:51:16.000000', '2025-11-29 17:51:16.000000', NULL, b'1', b'0', 'SEMESTER_1', 'Building Next-Level Dynamic Websites', NULL, '2bde1389-7741-4e99-a5b3-970cde1f98df', '5091d08f-e035-437b-aa31-a6d8b0645f54'),
('3698a89c-7f13-4c0b-a053-315516e901be', '2025-11-29 17:51:16.000000', '2025-11-29 17:51:16.000000', NULL, b'1', b'0', 'SEMESTER_3', 'ASP.NET Core MVC-The Framework for Future Web\nInnovations', NULL, NULL, '5091d08f-e035-437b-aa31-a6d8b0645f54'),
('3d46318a-79ab-4da4-b08d-e342cd3d8d6f', '2025-11-29 17:52:13.000000', '2025-11-29 17:52:13.000000', NULL, b'1', b'0', 'SEMESTER_1', 'Security Architecture and Hacking', NULL, 'a81b5138-7198-4b1f-875e-82f817c7f1e4', 'b3b62020-6d61-4613-8ce3-fff0e0d3c6bb'),
('40623d09-129a-4fb4-ac39-c5e9adf15355', '2025-11-29 17:51:08.000000', '2025-11-29 17:51:08.000000', NULL, b'1', b'0', 'SEMESTER_1', 'Inferential Statistical Analysis', NULL, '68ffdf62-8e47-4e14-9924-89051c18e25a', '08667b11-fe06-4187-a624-d2e9e9efa06b'),
('41eb3cfa-e54c-43fa-a0cb-e408addbaeb5', '2025-11-29 17:51:12.000000', '2025-11-29 17:51:12.000000', NULL, b'1', b'0', 'SEMESTER_4', 'Creating Services for the Web', NULL, 'a6db46ab-404f-40b9-bece-e55619cee8ca', '21fcf033-5dbf-4beb-987c-8b74bfca091d'),
('43e85690-24db-4028-b9d1-4cdc90dcf81f', '2025-11-29 17:51:25.000000', '2025-11-29 17:51:25.000000', NULL, b'1', b'0', 'SEMESTER_3', 'Editing Digital Video', NULL, '03b2d436-23cf-46ae-9fb5-a93bc7bbf3d6', '7d0458fd-dc6c-4d4c-835c-f0a7fe16f30a'),
('4a79577c-73f7-4a7f-94ab-e972cfb47b91', '2025-11-29 17:51:16.000000', '2025-11-29 17:51:16.000000', NULL, b'1', b'0', 'SEMESTER_1', 'Modern PHP Applications with Laravel', NULL, 'f5316c60-d10a-4475-bca2-0e75767a269f', '5091d08f-e035-437b-aa31-a6d8b0645f54'),
('4efec550-ab86-48c9-abf3-33c3e65f4212', '2025-11-29 17:52:13.000000', '2025-11-29 17:52:13.000000', NULL, b'1', b'0', 'SEMESTER_1', 'Introduction to Cyber Crime Investigation', NULL, '0340ebf9-423b-4ee5-9472-ced783156e10', 'b3b62020-6d61-4613-8ce3-fff0e0d3c6bb'),
('52a9a97e-8c8b-4e37-9aaf-b63e9c749ae3', '2025-11-29 17:51:16.000000', '2025-11-29 17:51:16.000000', NULL, b'1', b'0', 'SEMESTER_3', 'Application Development Using Flutter and Dart', NULL, NULL, '5091d08f-e035-437b-aa31-a6d8b0645f54'),
('55b9ecff-22d0-414e-a36b-8908e84c565d', '2025-11-29 17:51:16.000000', '2025-11-29 17:51:16.000000', NULL, b'1', b'0', 'SEMESTER_2', 'Django Framework for Python', NULL, '496e6f2a-d270-4936-8a79-1a818b6e43b2', '5091d08f-e035-437b-aa31-a6d8b0645f54'),
('56276ca1-94f5-4f91-a467-4738ae2874c3', '2025-11-29 17:51:16.000000', '2025-11-29 17:51:16.000000', NULL, b'1', b'0', 'SEMESTER_2', 'Building Rich Java Applications with JavaFX', NULL, 'b9ffd8c2-fc58-43e5-aeea-2ddaef8d05d8', '5091d08f-e035-437b-aa31-a6d8b0645f54'),
('581eab1b-12ad-4ec6-8c2b-fc10c5f70b52', '2025-11-29 17:52:13.000000', '2025-11-29 17:52:13.000000', NULL, b'1', b'0', 'SEMESTER_1', 'Advanced Ethical Hacking', NULL, '4f5f490c-61dd-4f25-9af7-9ffe5ba63731', 'b3b62020-6d61-4613-8ce3-fff0e0d3c6bb'),
('59c29add-875b-4f2e-928a-d86e74c298bf', '2025-11-29 17:51:16.000000', '2025-11-29 17:51:16.000000', NULL, b'1', b'0', 'SEMESTER_3', 'AI Primer', NULL, NULL, '5091d08f-e035-437b-aa31-a6d8b0645f54'),
('5b020eb4-7044-475c-9a43-7ffdb39b86eb', '2025-11-29 17:51:25.000000', '2025-11-29 17:51:25.000000', NULL, b'1', b'0', 'SEMESTER_2', 'Building Next Generation Websites', NULL, '4f9677b6-558b-42a8-8581-f8a5b217e198', '7d0458fd-dc6c-4d4c-835c-f0a7fe16f30a'),
('5b6f8a6d-7bf6-449f-9b52-f3dbb182d7e3', '2025-11-29 17:51:16.000000', '2025-11-29 17:51:16.000000', NULL, b'1', b'0', 'SEMESTER_2', 'Programming with Python', NULL, '21b5e4ae-c0b5-4c91-b7f4-bce9b21a4439', '5091d08f-e035-437b-aa31-a6d8b0645f54'),
('5c71fddc-70c2-4990-87a8-99a392f5fed8', '2025-11-29 17:51:25.000000', '2025-11-29 17:51:25.000000', NULL, b'1', b'0', 'SEMESTER_4', 'Modeling 3D Objects with Maya', NULL, '070d3033-55c5-4411-8352-f1da0a36acc0', '7d0458fd-dc6c-4d4c-835c-f0a7fe16f30a'),
('606fce9f-b01a-4d3e-9f0f-53a05b73d2ba', '2025-11-29 17:51:25.000000', '2025-11-29 17:51:25.000000', NULL, b'1', b'0', 'SEMESTER_3', 'Game Asset Modeling', NULL, '3f6dcfdf-11f6-4bbe-9921-80f442c5f5b4', '7d0458fd-dc6c-4d4c-835c-f0a7fe16f30a'),
('62cfef0d-2ca4-46fb-b0ab-1e8884eaa804', '2025-11-29 17:51:24.000000', '2025-11-29 17:51:24.000000', NULL, b'1', b'0', 'SEMESTER_1', 'Typography Design', NULL, 'df8d7b0e-e50d-4a42-864c-cb674c68f633', '7d0458fd-dc6c-4d4c-835c-f0a7fe16f30a'),
('664ac2c1-72ce-455e-a6c3-6b579dad8eb2', '2025-11-29 17:51:25.000000', '2025-11-29 17:51:25.000000', NULL, b'1', b'0', 'SEMESTER_3', 'Texturing of Game Asset', NULL, '203e4b5a-b679-4209-a0dd-f8eae47078ff', '7d0458fd-dc6c-4d4c-835c-f0a7fe16f30a'),
('68908f83-2a87-4beb-9d98-a3d1a177e96b', '2025-11-29 17:52:13.000000', '2025-11-29 17:52:13.000000', NULL, b'1', b'0', 'SEMESTER_1', 'Forensic Investigation', NULL, '0340ebf9-423b-4ee5-9472-ced783156e10', 'b3b62020-6d61-4613-8ce3-fff0e0d3c6bb'),
('7114f9d9-6f64-467c-8a82-df51cd1f9291', '2025-11-29 17:51:11.000000', '2025-11-29 17:51:11.000000', NULL, b'1', b'0', 'SEMESTER_1', 'Building Modern Websites', NULL, '2bde1389-7741-4e99-a5b3-970cde1f98df', '21fcf033-5dbf-4beb-987c-8b74bfca091d'),
('7549ccbb-7f37-4a76-a2c4-3278df2cd142', '2025-11-29 17:51:12.000000', '2025-11-29 17:51:12.000000', NULL, b'1', b'0', 'SEMESTER_2', 'Programming in C#', NULL, '87f25424-97d7-4f6a-8a85-ba92e68828e3', '21fcf033-5dbf-4beb-987c-8b74bfca091d'),
('75c2f038-ffe9-4ebf-8202-d4b24530f569', '2025-11-29 17:51:16.000000', '2025-11-29 17:51:16.000000', NULL, b'1', b'0', 'SEMESTER_4', 'Java Web Applications with Spring and Spring Boot', NULL, NULL, '5091d08f-e035-437b-aa31-a6d8b0645f54'),
('7bd63939-8637-48d0-8dee-2aceed875537', '2025-11-29 17:51:12.000000', '2025-11-29 17:51:12.000000', NULL, b'1', b'0', 'SEMESTER_2', 'Java Programming - II', NULL, 'b9ffd8c2-fc58-43e5-aeea-2ddaef8d05d8', '21fcf033-5dbf-4beb-987c-8b74bfca091d'),
('832d4d98-f0a5-49e2-9d5c-9b05df56d837', '2025-11-29 17:51:16.000000', '2025-11-29 17:51:16.000000', NULL, b'1', b'0', 'SEMESTER_4', 'Internship', NULL, NULL, '5091d08f-e035-437b-aa31-a6d8b0645f54'),
('8441b15d-cf6c-4ae1-b111-b9cff6ec062c', '2025-11-29 17:51:11.000000', '2025-11-29 17:51:11.000000', NULL, b'1', b'0', 'SEMESTER_1', 'Logic Building and Elementary Programming', NULL, '2908068d-a7f2-413a-a014-6bba769e4307', '21fcf033-5dbf-4beb-987c-8b74bfca091d'),
('85c59689-bc6f-4f3d-8d3c-8c5e549939fc', '2025-11-29 17:51:16.000000', '2025-11-29 17:51:16.000000', NULL, b'1', b'0', 'SEMESTER_4', 'Enterprise Application Development in Jakarta EE', NULL, NULL, '5091d08f-e035-437b-aa31-a6d8b0645f54'),
('87d9ad5c-ba74-4cb4-91b7-bb4941646c9c', '2025-11-29 17:51:25.000000', '2025-11-29 17:51:25.000000', NULL, b'1', b'0', 'SEMESTER_2', 'UI Design', NULL, '56ecb65f-a0af-4086-9034-f203e06ab343', '7d0458fd-dc6c-4d4c-835c-f0a7fe16f30a'),
('916382a8-4b8d-4d51-a866-1c0b9d617e8b', '2025-11-29 17:51:16.000000', '2025-11-29 17:51:16.000000', NULL, b'1', b'0', 'SEMESTER_3', 'eProject-Crafting .NET Applications', NULL, NULL, '5091d08f-e035-437b-aa31-a6d8b0645f54'),
('9207ff0a-f88b-493e-97eb-11c707bd72d3', '2025-11-29 17:51:08.000000', '2025-11-29 17:51:08.000000', NULL, b'1', b'0', 'SEMESTER_1', 'Application Based Programming in Python', NULL, '21b5e4ae-c0b5-4c91-b7f4-bce9b21a4439', '08667b11-fe06-4187-a624-d2e9e9efa06b'),
('92175178-61d9-49b8-a709-ce854079ec59', '2025-11-29 17:51:12.000000', '2025-11-29 17:51:12.000000', NULL, b'1', b'0', 'SEMESTER_4', 'Introduction to Dart Programming', NULL, '7c2f2b06-7478-42de-972a-e15ce3f4a707', '21fcf033-5dbf-4beb-987c-8b74bfca091d'),
('94137603-beac-4adc-bf08-b9b61b485f9d', '2025-11-29 17:51:25.000000', '2025-11-29 17:51:25.000000', NULL, b'1', b'0', 'SEMESTER_4', 'Character Animation with Maya', NULL, '5e2bb0f0-6770-44ac-8921-d3e6284478d5', '7d0458fd-dc6c-4d4c-835c-f0a7fe16f30a'),
('9a2a1edd-291e-439e-92c2-c57fe1f52256', '2025-11-29 17:51:16.000000', '2025-11-29 17:51:16.000000', NULL, b'1', b'0', 'SEMESTER_2', 'Server-side Development with NodeJS', NULL, '8739d39d-11b2-4730-ae25-2b201881dc56', '5091d08f-e035-437b-aa31-a6d8b0645f54'),
('9f8149ee-0012-4261-b4e5-d9470f12529f', '2025-11-29 17:51:25.000000', '2025-11-29 17:51:25.000000', NULL, b'1', b'0', 'SEMESTER_2', 'Web Animation', NULL, 'c4a7f472-1493-4f27-b912-ba8ad373ed06', '7d0458fd-dc6c-4d4c-835c-f0a7fe16f30a'),
('a0801c18-7dcc-4be3-8767-a944c6dacdfa', '2025-11-29 17:51:24.000000', '2025-11-29 17:51:24.000000', NULL, b'1', b'0', 'SEMESTER_1', 'Publishing for the Media', NULL, '97d50f64-1490-495d-9d8e-a011e8913d95', '7d0458fd-dc6c-4d4c-835c-f0a7fe16f30a'),
('a0cc015d-6d95-40b3-96fe-6c1cc51c9f44', '2025-11-29 17:51:16.000000', '2025-11-29 17:51:16.000000', NULL, b'1', b'0', 'SEMESTER_3', 'Powerful and Rich Applications with Microsoft Azure', NULL, NULL, '5091d08f-e035-437b-aa31-a6d8b0645f54'),
('a1023450-666f-4da3-89be-f181157c9e13', '2025-11-29 17:52:13.000000', '2025-11-29 17:52:13.000000', NULL, b'1', b'0', 'SEMESTER_1', 'Windows and Linux Hacking', NULL, '71a8af0e-6a34-46e3-b23c-c6620f15dcda', 'b3b62020-6d61-4613-8ce3-fff0e0d3c6bb'),
('a19aa8bd-3f10-47ac-b3d4-b750244f3201', '2025-11-29 17:51:08.000000', '2025-11-29 17:51:08.000000', NULL, b'1', b'0', 'SEMESTER_1', 'Data Analysis with MS Excel', NULL, '7d8c6eea-74d3-4c63-8e4e-3741528e9b05', '08667b11-fe06-4187-a624-d2e9e9efa06b'),
('a1cd5b3c-45d1-4a17-9082-a0ce6634a5fc', '2025-11-29 17:51:08.000000', '2025-11-29 17:51:08.000000', NULL, b'1', b'0', 'SEMESTER_1', 'Managing Large datasets with MongoDB', NULL, '04e6ddbe-81dc-4954-85f6-e907e68ccb1e', '08667b11-fe06-4187-a624-d2e9e9efa06b'),
('a28e1d5c-e74b-4fc4-93b7-845c51190fde', '2025-11-29 17:51:16.000000', '2025-11-29 17:51:16.000000', NULL, b'1', b'0', 'SEMESTER_4', 'AI Applications of NLP', NULL, NULL, '5091d08f-e035-437b-aa31-a6d8b0645f54'),
('a4d02bb6-6943-4efc-9b7a-3538b1f7a623', '2025-11-29 17:51:24.000000', '2025-11-29 17:51:24.000000', NULL, b'1', b'0', 'SEMESTER_1', 'Digital Art', NULL, 'b63ea55d-4233-43fb-aa67-914d585eb34f', '7d0458fd-dc6c-4d4c-835c-f0a7fe16f30a'),
('a640a815-7225-49c8-a5c0-47fda2cc31e4', '2025-11-29 17:51:25.000000', '2025-11-29 17:51:25.000000', NULL, b'1', b'0', 'SEMESTER_3', 'Storyboarding', NULL, '0272e742-992d-4251-bb42-2578791601a0', '7d0458fd-dc6c-4d4c-835c-f0a7fe16f30a'),
('a6dccf0e-d205-4d7e-baa7-b54e1633f975', '2025-11-29 17:51:24.000000', '2025-11-29 17:51:24.000000', NULL, b'1', b'0', 'SEMESTER_1', 'Magic with Images', NULL, '93bba4d5-0738-4e43-b33a-dbed9b4ea4e0', '7d0458fd-dc6c-4d4c-835c-f0a7fe16f30a'),
('a721787a-f831-4362-a607-9bbab8e594b5', '2025-11-29 17:51:12.000000', '2025-11-29 17:51:12.000000', NULL, b'1', b'0', 'SEMESTER_2', 'Java Programming - I', NULL, 'b9ffd8c2-fc58-43e5-aeea-2ddaef8d05d8', '21fcf033-5dbf-4beb-987c-8b74bfca091d'),
('a746891d-a6fb-432b-a149-d0e6d22f5395', '2025-11-29 17:51:25.000000', '2025-11-29 17:51:25.000000', NULL, b'1', b'0', 'SEMESTER_3', 'Portfolio-3D Game design (Project)', NULL, '758658b0-291e-4b25-8dc7-c5a056d486aa', '7d0458fd-dc6c-4d4c-835c-f0a7fe16f30a'),
('ac27543d-8558-4861-a312-8e9da3eb725c', '2025-11-29 17:51:16.000000', '2025-11-29 17:51:16.000000', NULL, b'1', b'0', 'SEMESTER_3', 'Introduction to Dart Programming', NULL, NULL, '5091d08f-e035-437b-aa31-a6d8b0645f54'),
('ad1c8e8c-8c53-461b-a52f-7b994d220202', '2025-11-29 17:51:25.000000', '2025-11-29 17:51:25.000000', NULL, b'1', b'0', 'SEMESTER_3', 'Introduction to Blender', NULL, '3f6dcfdf-11f6-4bbe-9921-80f442c5f5b4', '7d0458fd-dc6c-4d4c-835c-f0a7fe16f30a'),
('afebff81-96d4-480b-9bd1-cfcbd2ac7f7e', '2025-11-29 17:51:25.000000', '2025-11-29 17:51:25.000000', NULL, b'1', b'0', 'SEMESTER_4', 'Texturing 3D Objects with Maya', NULL, '070d3033-55c5-4411-8352-f1da0a36acc0', '7d0458fd-dc6c-4d4c-835c-f0a7fe16f30a'),
('b09f5088-d577-445e-b951-ab1f1640886e', '2025-11-29 17:51:16.000000', '2025-11-29 17:51:16.000000', NULL, b'1', b'0', 'SEMESTER_4', 'Project-Robust Java Applications for Enterprises', NULL, NULL, '5091d08f-e035-437b-aa31-a6d8b0645f54'),
('b115ef8c-cf27-4b69-8ef5-d28e0e4b056f', '2025-11-29 17:51:16.000000', '2025-11-29 17:51:16.000000', NULL, b'1', b'0', 'SEMESTER_4', 'Deployment System and Containerize with Docker\nand Kubernetes', NULL, NULL, '5091d08f-e035-437b-aa31-a6d8b0645f54'),
('b2604d2e-49db-4ce7-a528-8499c59ef18d', '2025-11-29 17:51:11.000000', '2025-11-29 17:51:11.000000', NULL, b'1', b'0', 'SEMESTER_1', 'UI/UX for Responsive Web Design', NULL, '49b4e5cf-4b2b-4fd5-aa43-6c45d6f9d835', '21fcf033-5dbf-4beb-987c-8b74bfca091d'),
('b4a10b39-e87c-4db2-8b59-3d11e8ce0543', '2025-11-29 17:51:12.000000', '2025-11-29 17:51:12.000000', NULL, b'1', b'0', 'SEMESTER_1', 'PHP Development with Laravel Framework', NULL, '54d19017-e49e-4630-8d47-c8f4efa4d57c', '21fcf033-5dbf-4beb-987c-8b74bfca091d'),
('b83dcd03-225d-44e1-ae4e-9ae9ae140bf7', '2025-11-29 17:51:25.000000', '2025-11-29 17:51:25.000000', NULL, b'1', b'0', 'SEMESTER_4', 'Rigging 3D Objects with MAYA', NULL, 'f93d1c1b-ce60-4444-9ad4-f1f0f3f7db8a', '7d0458fd-dc6c-4d4c-835c-f0a7fe16f30a'),
('b8f339f8-c249-4b74-9c23-946c6ecde5b4', '2025-11-29 17:51:25.000000', '2025-11-29 17:51:25.000000', NULL, b'1', b'0', 'SEMESTER_3', 'Game Idea and Visualization', NULL, 'd3ab4747-d947-4133-b5b3-2e55dd5ebb4f', '7d0458fd-dc6c-4d4c-835c-f0a7fe16f30a'),
('ba76e09f-9f32-45e9-a2e7-a30f40ebc51a', '2025-11-29 17:51:12.000000', '2025-11-29 17:51:12.000000', NULL, b'1', b'0', 'SEMESTER_3', 'Developing Applications with Python', NULL, '21b5e4ae-c0b5-4c91-b7f4-bce9b21a4439', '21fcf033-5dbf-4beb-987c-8b74bfca091d'),
('bb9031e2-2950-4298-a619-4009bca74d41', '2025-11-29 17:51:12.000000', '2025-11-29 17:51:12.000000', NULL, b'1', b'0', 'SEMESTER_3', 'DevelopingASP.NET Core MVC Applications', NULL, '6ed26342-f6d8-4b32-b01e-6464cad9c0d9', '21fcf033-5dbf-4beb-987c-8b74bfca091d'),
('bea5e805-8c09-45b6-ae19-3aac3d25be9d', '2025-11-29 17:51:24.000000', '2025-11-29 17:51:24.000000', NULL, b'1', b'0', 'SEMESTER_1', 'Print Portfolio (Project)', NULL, '97d50f64-1490-495d-9d8e-a011e8913d95', '7d0458fd-dc6c-4d4c-835c-f0a7fe16f30a'),
('bf80cf4a-53bc-4862-b8cb-a06c56447563', '2025-11-29 17:51:12.000000', '2025-11-29 17:51:12.000000', NULL, b'1', b'0', 'SEMESTER_3', 'eProject -.NET Web Application Development', NULL, '96649d3b-aad5-4015-846e-ccaccd2b7cb5', '21fcf033-5dbf-4beb-987c-8b74bfca091d'),
('c28f1867-43aa-41b3-ab24-1edf92ab9a5a', '2025-11-29 17:51:16.000000', '2025-11-29 17:51:16.000000', NULL, b'1', b'0', 'SEMESTER_4', 'Modern Web Components with Jakarta EE', NULL, NULL, '5091d08f-e035-437b-aa31-a6d8b0645f54'),
('d0fdfcce-aec8-425b-858b-74997972f492', '2025-11-29 17:51:25.000000', '2025-11-29 17:51:25.000000', NULL, b'1', b'0', 'SEMESTER_2', 'Web Portfolio (eProject)', NULL, '67c3a030-1651-4d4b-ae71-094c0a186e17', '7d0458fd-dc6c-4d4c-835c-f0a7fe16f30a'),
('d3285fd3-031e-4d7f-a84d-6ea96fd1d190', '2025-11-29 17:51:24.000000', '2025-11-29 17:51:24.000000', NULL, b'1', b'0', 'SEMESTER_1', 'Concepts of Graphics and Illustrations', NULL, 'c5a0c93b-27a2-401f-b48e-6d30faa8ac1d', '7d0458fd-dc6c-4d4c-835c-f0a7fe16f30a'),
('d349b21a-a567-4579-a72a-d99b1d706381', '2025-11-29 17:51:16.000000', '2025-11-29 17:51:16.000000', NULL, b'1', b'0', 'SEMESTER_2', 'Distributed Version Control', NULL, 'e6bfb1b5-7811-4166-8efc-f386163591b2', '5091d08f-e035-437b-aa31-a6d8b0645f54'),
('d3dfe0ca-a120-48de-9d52-3adb4ba5bd24', '2025-11-29 17:51:25.000000', '2025-11-29 17:51:25.000000', NULL, b'1', b'0', 'SEMESTER_2', 'Web Page Design', NULL, '6e6d9654-19ae-4f58-a46e-630c8dfc1ec3', '7d0458fd-dc6c-4d4c-835c-f0a7fe16f30a'),
('d43e24fa-df0e-49e7-b3f5-9049a0c0ed58', '2025-11-29 17:51:16.000000', '2025-11-29 17:51:16.000000', NULL, b'1', b'0', 'SEMESTER_1', 'Foundations of Programming with C', NULL, '2908068d-a7f2-413a-a014-6bba769e4307', '5091d08f-e035-437b-aa31-a6d8b0645f54'),
('d4c9824d-d7a4-40c5-89a9-d2cfe982a45b', '2025-11-29 17:51:16.000000', '2025-11-29 17:51:16.000000', NULL, b'1', b'0', 'SEMESTER_2', 'Proficient Programming with C#', NULL, '87f25424-97d7-4f6a-8a85-ba92e68828e3', '5091d08f-e035-437b-aa31-a6d8b0645f54'),
('d600d632-33cf-4e99-aa1b-d55f60001670', '2025-11-29 17:51:25.000000', '2025-11-29 17:51:25.000000', NULL, b'1', b'0', 'SEMESTER_3', 'Creating Motion Graphics', NULL, '2c2f5aa6-c105-4d65-a6ec-11c2628c8f10', '7d0458fd-dc6c-4d4c-835c-f0a7fe16f30a'),
('d67a8233-ae8d-4fdd-9a2d-c90b2eedf9a3', '2025-11-29 17:51:16.000000', '2025-11-29 17:51:16.000000', NULL, b'1', b'0', 'SEMESTER_1', 'Responsive UI/UX Strategies', NULL, '49b4e5cf-4b2b-4fd5-aa43-6c45d6f9d835', '5091d08f-e035-437b-aa31-a6d8b0645f54'),
('d68bcf14-bd28-4ea5-950a-04ba1c0949c7', '2025-11-29 17:52:13.000000', '2025-11-29 17:52:13.000000', NULL, b'1', b'0', 'SEMESTER_1', 'Introduction to Cyber Forensics', NULL, '0340ebf9-423b-4ee5-9472-ced783156e10', 'b3b62020-6d61-4613-8ce3-fff0e0d3c6bb'),
('d6f45f4b-8405-428b-a1f6-77b76d56cfaa', '2025-11-29 17:51:16.000000', '2025-11-29 17:51:16.000000', NULL, b'1', b'0', 'SEMESTER_2', 'Core Java Concepts and Techniques', NULL, 'b9ffd8c2-fc58-43e5-aeea-2ddaef8d05d8', '5091d08f-e035-437b-aa31-a6d8b0645f54'),
('deae954e-7c8b-4ae4-909d-37db0b6ba447', '2025-11-29 17:52:13.000000', '2025-11-29 17:52:13.000000', NULL, b'1', b'0', 'SEMESTER_1', 'Social Media Forensics', NULL, '0340ebf9-423b-4ee5-9472-ced783156e10', 'b3b62020-6d61-4613-8ce3-fff0e0d3c6bb'),
('e02ac708-3c51-49ad-bd61-09789126af18', '2025-11-29 17:51:12.000000', '2025-11-29 17:51:12.000000', NULL, b'1', b'0', 'SEMESTER_4', 'Building Java Web Applications with Spring Framework', NULL, 'ad8a13e4-9159-44c2-b558-eb0d1d48c952', '21fcf033-5dbf-4beb-987c-8b74bfca091d'),
('e918b4a2-3b96-4bbe-888f-530d5df4079b', '2025-11-29 17:51:25.000000', '2025-11-29 17:51:25.000000', NULL, b'1', b'0', 'SEMESTER_4', 'Digital Preproduction', NULL, '59ec1868-1267-4cad-a9be-964b9d81b4c9', '7d0458fd-dc6c-4d4c-835c-f0a7fe16f30a'),
('e9f55bac-88a8-4ac2-a8c6-daeff8bc1fb9', '2025-11-29 17:51:08.000000', '2025-11-29 17:51:08.000000', NULL, b'1', b'0', 'SEMESTER_1', 'Data handling using T-SQL', NULL, '3e63f9cf-7e50-43f3-8a58-670f70226984', '08667b11-fe06-4187-a624-d2e9e9efa06b'),
('ec6840e6-9e36-486f-a7c5-fcb3a05c0b71', '2025-11-29 17:51:12.000000', '2025-11-29 17:51:12.000000', NULL, b'1', b'0', 'SEMESTER_4', 'Application Development Using Flutter and Dart', NULL, '9835cda4-2b60-413b-af39-36de52c337e2', '21fcf033-5dbf-4beb-987c-8b74bfca091d'),
('f0c47d52-7c7f-4722-b523-1b85c7d6cf57', '2025-11-29 17:51:24.000000', '2025-11-29 17:51:24.000000', NULL, b'1', b'0', 'SEMESTER_1', 'Design for Print and Advertising', NULL, 'edc5b6d1-a2ae-4099-a9bd-48333222a2dc', '7d0458fd-dc6c-4d4c-835c-f0a7fe16f30a'),
('f12df044-c774-4b75-ae24-e74541999359', '2025-11-29 17:51:25.000000', '2025-11-29 17:51:25.000000', NULL, b'1', b'0', 'SEMESTER_3', 'Digital Soundtrack', NULL, '921f504e-7cf6-4b45-a749-82ec7b971edb', '7d0458fd-dc6c-4d4c-835c-f0a7fe16f30a'),
('f37893b9-5bdc-429e-8a0a-ace6c7ac9b48', '2025-11-29 17:52:13.000000', '2025-11-29 17:52:13.000000', NULL, b'1', b'0', 'SEMESTER_1', 'Information Security and Organisational Structure', NULL, '8bedf249-4959-4fea-a4df-292149876b41', 'b3b62020-6d61-4613-8ce3-fff0e0d3c6bb'),
('f43a3bf8-05f9-4a53-8d3a-78a78e82f9c8', '2025-11-29 17:51:16.000000', '2025-11-29 17:51:16.000000', NULL, b'1', b'0', 'SEMESTER_2', 'Project-Java Desktop Application Development', NULL, 'b9ffd8c2-fc58-43e5-aeea-2ddaef8d05d8', '5091d08f-e035-437b-aa31-a6d8b0645f54'),
('f7f05203-a872-4203-84f1-0f6f09bcf432', '2025-11-29 17:51:12.000000', '2025-11-29 17:51:12.000000', NULL, b'1', b'0', 'SEMESTER_3', 'Large Data Management (MongoDB)', NULL, '04e6ddbe-81dc-4954-85f6-e907e68ccb1e', '21fcf033-5dbf-4beb-987c-8b74bfca091d'),
('fa58accf-8e05-43d7-ad37-a12ebcb9df8e', '2025-11-29 17:51:12.000000', '2025-11-29 17:51:12.000000', NULL, b'1', b'0', 'SEMESTER_2', 'Project-Java Application Developmemt', NULL, 'b9ffd8c2-fc58-43e5-aeea-2ddaef8d05d8', '21fcf033-5dbf-4beb-987c-8b74bfca091d'),
('fabfc6f7-860a-445c-b8bf-01b6dd3d7ae6', '2025-11-29 17:52:13.000000', '2025-11-29 17:52:13.000000', NULL, b'1', b'0', 'SEMESTER_1', 'Handheld Devices Security', NULL, '0340ebf9-423b-4ee5-9472-ced783156e10', 'b3b62020-6d61-4613-8ce3-fff0e0d3c6bb'),
('fb7052b1-5c84-4daa-8316-2a3b110fab8c', '2025-11-29 17:51:25.000000', '2025-11-29 17:51:25.000000', NULL, b'1', b'0', 'SEMESTER_2', 'UI and UX for Responsive Web Design', NULL, '88441b9d-6b76-4807-8fcd-dfa1883f8a67', '7d0458fd-dc6c-4d4c-835c-f0a7fe16f30a'),
('fc2b75f5-43d0-4539-9c2e-87ea97ca6311', '2025-11-29 17:51:08.000000', '2025-11-29 17:51:08.000000', NULL, b'1', b'0', 'SEMESTER_1', 'Project-Analyzing Data with R', NULL, '365f4e30-2275-412e-abae-6cd8b85f5c6d', '08667b11-fe06-4187-a624-d2e9e9efa06b'),
('fcb3ce2d-cf5c-4235-b563-55f484f9dd4d', '2025-11-29 17:51:25.000000', '2025-11-29 17:51:25.000000', NULL, b'1', b'0', 'SEMESTER_2', 'Web Designing Concepts', NULL, '67c3a030-1651-4d4b-ae71-094c0a186e17', '7d0458fd-dc6c-4d4c-835c-f0a7fe16f30a'),
('fd278f13-d279-4b09-8222-ff90024b6921', '2025-11-29 17:51:16.000000', '2025-11-29 17:51:16.000000', NULL, b'1', b'0', 'SEMESTER_4', 'Creating Services for the Web', NULL, NULL, '5091d08f-e035-437b-aa31-a6d8b0645f54');

-- --------------------------------------------------------

--
-- Table structure for table `subject_registrations`
--

CREATE TABLE `subject_registrations` (
  `id` varchar(255) NOT NULL,
  `creation_timestamp` datetime(6) DEFAULT NULL,
  `update_timestamp` datetime(6) DEFAULT NULL,
  `quarter` enum('QUY1','QUY2','QUY3','QUY4') NOT NULL,
  `reason_for_carry_over` text DEFAULT NULL,
  `status` enum('REGISTERED','COMPLETED','NOT_COMPLETED','CARRYOVER') NOT NULL,
  `year` int(11) NOT NULL,
  `subject_id` varchar(255) NOT NULL,
  `teacher_id` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `subject_registrations`
--

INSERT INTO `subject_registrations` (`id`, `creation_timestamp`, `update_timestamp`, `quarter`, `reason_for_carry_over`, `status`, `year`, `subject_id`, `teacher_id`) VALUES
('25e9fe60-89a7-4b12-894c-a032d5a68752', '2025-11-30 02:19:58.000000', '2025-11-30 02:19:58.000000', 'QUY2', '- - Thi chứng nhận Aptech\n- Giảng thử\nDeadline: 02-Jun-2025', 'REGISTERED', 2025, '33bb4ad0-f386-4060-95a7-cbecddc71b85', '2'),
('5e9e2219-8e6e-4e18-8252-9d000351bc1a', '2025-11-30 02:19:58.000000', '2025-11-30 02:19:58.000000', 'QUY2', '- - Thi chứng nhận Aptech\n- Giảng thử\nDeadline: 02-Jun-2025', 'REGISTERED', 2025, '0ef959a9-fef1-4207-83f3-bd1744f1009d', '2');

-- --------------------------------------------------------

--
-- Table structure for table `subject_systems`
--

CREATE TABLE `subject_systems` (
  `id` varchar(255) NOT NULL,
  `creation_timestamp` datetime(6) DEFAULT NULL,
  `update_timestamp` datetime(6) DEFAULT NULL,
  `is_active` bit(1) NOT NULL,
  `system_code` varchar(20) NOT NULL,
  `system_name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `subject_systems`
--

INSERT INTO `subject_systems` (`id`, `creation_timestamp`, `update_timestamp`, `is_active`, `system_code`, `system_name`) VALUES
('08667b11-fe06-4187-a624-d2e9e9efa06b', '2025-11-29 17:50:18.000000', '2025-11-29 17:50:18.000000', b'1', 'ACN Pro OV 7096', 'ACN Pro OV 7096'),
('21fcf033-5dbf-4beb-987c-8b74bfca091d', '2025-11-29 17:51:01.000000', '2025-11-29 17:51:01.000000', b'1', 'Skill Aptech OV 7191', 'Skill Aptech OV 7191'),
('5091d08f-e035-437b-aa31-a6d8b0645f54', '2025-11-29 17:50:07.000000', '2025-11-29 17:50:07.000000', b'1', 'Skill Aptech OV 7195', 'Skill Aptech OV 7195'),
('7d0458fd-dc6c-4d4c-835c-f0a7fe16f30a', '2025-11-29 17:50:25.000000', '2025-11-29 17:50:25.000000', b'1', 'Skill Arena OV 6899', 'Skill ACCP OV 6680'),
('b3b62020-6d61-4613-8ce3-fff0e0d3c6bb', '2025-11-29 17:52:08.000000', '2025-11-29 17:52:08.000000', b'1', 'ACCP OV 6680', 'ACCP OV 6680');

-- --------------------------------------------------------

--
-- Table structure for table `subject_system_assignments`
--

CREATE TABLE `subject_system_assignments` (
  `id` varchar(255) NOT NULL,
  `creation_timestamp` datetime(6) DEFAULT NULL,
  `update_timestamp` datetime(6) DEFAULT NULL,
  `hours` int(11) DEFAULT NULL,
  `is_active` bit(1) NOT NULL,
  `note` varchar(500) DEFAULT NULL,
  `semester` enum('SEMESTER_1','SEMESTER_2','SEMESTER_3','SEMESTER_4') DEFAULT NULL,
  `subject_id` varchar(255) NOT NULL,
  `system_id` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `subject_system_assignments`
--

INSERT INTO `subject_system_assignments` (`id`, `creation_timestamp`, `update_timestamp`, `hours`, `is_active`, `note`, `semester`, `subject_id`, `system_id`) VALUES
('022df5dd-f079-4d3a-8c52-7b6ff3ed2676', '2025-11-29 17:52:13.000000', '2025-11-29 17:52:13.000000', NULL, b'1', NULL, 'SEMESTER_1', '581eab1b-12ad-4ec6-8c2b-fc10c5f70b52', 'b3b62020-6d61-4613-8ce3-fff0e0d3c6bb'),
('054b6500-ab69-437c-9b3e-83ccae99d209', '2025-11-29 17:51:16.000000', '2025-11-29 17:51:16.000000', NULL, b'1', NULL, 'SEMESTER_3', '916382a8-4b8d-4d51-a866-1c0b9d617e8b', '5091d08f-e035-437b-aa31-a6d8b0645f54'),
('098cf9dd-3227-4ddb-a018-e3c0301de9fc', '2025-11-29 17:51:08.000000', '2025-11-29 17:51:08.000000', NULL, b'1', NULL, 'SEMESTER_1', '9207ff0a-f88b-493e-97eb-11c707bd72d3', '08667b11-fe06-4187-a624-d2e9e9efa06b'),
('099de770-015c-430a-8efd-a152b1739184', '2025-11-29 17:51:16.000000', '2025-11-29 17:51:16.000000', NULL, b'1', NULL, 'SEMESTER_1', '09073000-ce2b-4cd1-99d2-35e9663ab8e4', '5091d08f-e035-437b-aa31-a6d8b0645f54'),
('0c1fef1f-6da7-4e3d-ba7f-4dbdf61b2d8c', '2025-11-29 17:51:25.000000', '2025-11-29 17:51:25.000000', NULL, b'1', NULL, 'SEMESTER_2', '5b020eb4-7044-475c-9a43-7ffdb39b86eb', '7d0458fd-dc6c-4d4c-835c-f0a7fe16f30a'),
('0ee8281a-5e4f-4959-a048-95a698bfcbf7', '2025-11-29 17:51:25.000000', '2025-11-29 17:51:25.000000', NULL, b'1', NULL, 'SEMESTER_2', '05756982-46a1-4bbc-8055-a3321aeed64b', '7d0458fd-dc6c-4d4c-835c-f0a7fe16f30a'),
('0f12192a-6db3-4fbb-b3a5-63a8dbfafe44', '2025-11-29 17:51:24.000000', '2025-11-29 17:51:24.000000', NULL, b'1', NULL, 'SEMESTER_1', 'f0c47d52-7c7f-4722-b523-1b85c7d6cf57', '7d0458fd-dc6c-4d4c-835c-f0a7fe16f30a'),
('11b9cd0f-aeea-4c9f-b408-8b7706266a82', '2025-11-29 17:51:12.000000', '2025-11-29 17:51:12.000000', NULL, b'1', NULL, 'SEMESTER_4', '41eb3cfa-e54c-43fa-a0cb-e408addbaeb5', '21fcf033-5dbf-4beb-987c-8b74bfca091d'),
('1776bd92-9701-4213-8f62-c6999c53e6a1', '2025-11-29 17:51:11.000000', '2025-11-29 17:51:11.000000', NULL, b'1', NULL, 'SEMESTER_1', 'b2604d2e-49db-4ce7-a528-8499c59ef18d', '21fcf033-5dbf-4beb-987c-8b74bfca091d'),
('183674b2-0a7b-4841-bfc8-6e15f6f797e3', '2025-11-29 17:51:25.000000', '2025-11-29 17:51:25.000000', NULL, b'1', NULL, 'SEMESTER_2', 'fb7052b1-5c84-4daa-8316-2a3b110fab8c', '7d0458fd-dc6c-4d4c-835c-f0a7fe16f30a'),
('1bf2cf99-1104-498b-a612-9be7548847c7', '2025-11-29 17:52:13.000000', '2025-11-29 17:52:13.000000', NULL, b'1', NULL, 'SEMESTER_1', 'f37893b9-5bdc-429e-8a0a-ace6c7ac9b48', 'b3b62020-6d61-4613-8ce3-fff0e0d3c6bb'),
('1deaa2a2-adb2-4091-8fd9-47f78fb2e29a', '2025-11-29 17:52:13.000000', '2025-11-29 17:52:13.000000', NULL, b'1', NULL, 'SEMESTER_1', '68908f83-2a87-4beb-9d98-a3d1a177e96b', 'b3b62020-6d61-4613-8ce3-fff0e0d3c6bb'),
('26db7365-3d78-4fd4-bb05-ad7a941f77a1', '2025-11-29 17:51:11.000000', '2025-11-29 17:51:11.000000', NULL, b'1', NULL, 'SEMESTER_1', '0ef959a9-fef1-4207-83f3-bd1744f1009d', '21fcf033-5dbf-4beb-987c-8b74bfca091d'),
('291563d7-7042-48e3-85c7-03ddea462f2d', '2025-11-29 17:51:25.000000', '2025-11-29 17:51:25.000000', NULL, b'1', NULL, 'SEMESTER_4', '2e7c1f55-fef2-49f5-9b20-232e9bce6644', '7d0458fd-dc6c-4d4c-835c-f0a7fe16f30a'),
('291cc08b-f0b0-4af0-b3b4-45247f973109', '2025-11-29 17:51:25.000000', '2025-11-29 17:51:25.000000', NULL, b'1', NULL, 'SEMESTER_3', '664ac2c1-72ce-455e-a6c3-6b579dad8eb2', '7d0458fd-dc6c-4d4c-835c-f0a7fe16f30a'),
('2a174dcb-2cee-4692-bcfe-684b8be80a8b', '2025-11-29 17:51:12.000000', '2025-11-29 17:51:12.000000', NULL, b'1', NULL, 'SEMESTER_3', 'bb9031e2-2950-4298-a619-4009bca74d41', '21fcf033-5dbf-4beb-987c-8b74bfca091d'),
('2bcb26aa-4415-4374-bd81-bf5d46989895', '2025-11-29 17:51:25.000000', '2025-11-29 17:51:25.000000', NULL, b'1', NULL, 'SEMESTER_2', 'fcb3ce2d-cf5c-4235-b563-55f484f9dd4d', '7d0458fd-dc6c-4d4c-835c-f0a7fe16f30a'),
('2caae227-d5c5-4433-b14c-8b94c8c01c68', '2025-11-29 17:51:24.000000', '2025-11-29 17:51:24.000000', NULL, b'1', NULL, 'SEMESTER_1', 'bea5e805-8c09-45b6-ae19-3aac3d25be9d', '7d0458fd-dc6c-4d4c-835c-f0a7fe16f30a'),
('2cf82ea0-8814-4547-88b3-03b0eac46450', '2025-11-29 17:51:24.000000', '2025-11-29 17:51:24.000000', NULL, b'1', NULL, 'SEMESTER_1', 'a4d02bb6-6943-4efc-9b7a-3538b1f7a623', '7d0458fd-dc6c-4d4c-835c-f0a7fe16f30a'),
('2d1d02b7-f3d5-41cd-82e6-71cf08c1ba55', '2025-11-29 17:51:16.000000', '2025-11-29 17:51:16.000000', NULL, b'1', NULL, 'SEMESTER_2', '56276ca1-94f5-4f91-a467-4738ae2874c3', '5091d08f-e035-437b-aa31-a6d8b0645f54'),
('2d9cce6a-3e7e-4ac4-a83f-968f157d9680', '2025-11-29 17:51:25.000000', '2025-11-29 17:51:25.000000', NULL, b'1', NULL, 'SEMESTER_3', '606fce9f-b01a-4d3e-9f0f-53a05b73d2ba', '7d0458fd-dc6c-4d4c-835c-f0a7fe16f30a'),
('3054bb07-7200-44c9-8950-efa5dd5fb5a2', '2025-11-29 17:51:12.000000', '2025-11-29 17:51:12.000000', NULL, b'1', NULL, 'SEMESTER_3', '17e0c7de-dd7f-4171-a8cf-989d5872e7aa', '21fcf033-5dbf-4beb-987c-8b74bfca091d'),
('34822aee-e5b5-4369-8565-fbb3ee5c41ed', '2025-11-29 17:51:16.000000', '2025-11-29 17:51:16.000000', NULL, b'1', NULL, 'SEMESTER_4', 'b09f5088-d577-445e-b951-ab1f1640886e', '5091d08f-e035-437b-aa31-a6d8b0645f54'),
('3bb6cd12-607c-47f6-8bf1-3c299c611cdf', '2025-11-29 17:51:25.000000', '2025-11-29 17:51:25.000000', NULL, b'1', NULL, 'SEMESTER_3', 'd600d632-33cf-4e99-aa1b-d55f60001670', '7d0458fd-dc6c-4d4c-835c-f0a7fe16f30a'),
('3c7bed59-8c42-4c3b-80b7-e31b9e712c74', '2025-11-29 17:52:13.000000', '2025-11-29 17:52:13.000000', NULL, b'1', NULL, 'SEMESTER_1', 'd68bcf14-bd28-4ea5-950a-04ba1c0949c7', 'b3b62020-6d61-4613-8ce3-fff0e0d3c6bb'),
('3d4280b4-189f-43a0-bf7c-6a72de6e9777', '2025-11-29 17:51:16.000000', '2025-11-29 17:51:16.000000', NULL, b'1', NULL, 'SEMESTER_2', '55b9ecff-22d0-414e-a36b-8908e84c565d', '5091d08f-e035-437b-aa31-a6d8b0645f54'),
('3e6a3a8e-db86-4c6f-8a05-157a5dea5dbd', '2025-11-29 17:51:16.000000', '2025-11-29 17:51:16.000000', NULL, b'1', NULL, 'SEMESTER_2', 'd6f45f4b-8405-428b-a1f6-77b76d56cfaa', '5091d08f-e035-437b-aa31-a6d8b0645f54'),
('3f6a9e39-d141-4096-9b51-228acbee7048', '2025-11-29 17:52:13.000000', '2025-11-29 17:52:13.000000', NULL, b'1', NULL, 'SEMESTER_1', '2f58bcce-1ff4-49a7-aa7a-68a82ecdf7f0', 'b3b62020-6d61-4613-8ce3-fff0e0d3c6bb'),
('3ff1e6b4-482c-46a4-84b8-fbff207b923b', '2025-11-29 17:51:16.000000', '2025-11-29 17:51:16.000000', NULL, b'1', NULL, 'SEMESTER_2', 'd4c9824d-d7a4-40c5-89a9-d2cfe982a45b', '5091d08f-e035-437b-aa31-a6d8b0645f54'),
('405c9097-d844-4875-bd1b-5a9a6f135ef6', '2025-11-29 17:51:12.000000', '2025-11-29 17:51:12.000000', NULL, b'1', NULL, 'SEMESTER_4', 'ec6840e6-9e36-486f-a7c5-fcb3a05c0b71', '21fcf033-5dbf-4beb-987c-8b74bfca091d'),
('40f9b3f3-e834-4b9e-9058-281c1e4e0c62', '2025-11-29 17:51:12.000000', '2025-11-29 17:51:12.000000', NULL, b'1', NULL, 'SEMESTER_3', '23458a2d-4f72-4dbf-a801-5d7e75333bc7', '21fcf033-5dbf-4beb-987c-8b74bfca091d'),
('476ba2e5-80cf-4574-a09b-258e646b03ee', '2025-11-29 17:51:16.000000', '2025-11-29 17:51:16.000000', NULL, b'1', NULL, 'SEMESTER_1', '17040c1e-3cf6-448f-bca8-8941ee69b785', '5091d08f-e035-437b-aa31-a6d8b0645f54'),
('47b4a92f-1c99-4aaf-ab4a-6b77bf51fb82', '2025-11-29 17:51:24.000000', '2025-11-29 17:51:24.000000', NULL, b'1', NULL, 'SEMESTER_1', 'a0801c18-7dcc-4be3-8767-a944c6dacdfa', '7d0458fd-dc6c-4d4c-835c-f0a7fe16f30a'),
('4c031a4b-6638-4449-b1f5-3f811dc7e4d8', '2025-11-29 17:51:12.000000', '2025-11-29 17:51:12.000000', NULL, b'1', NULL, 'SEMESTER_1', '33bb4ad0-f386-4060-95a7-cbecddc71b85', '21fcf033-5dbf-4beb-987c-8b74bfca091d'),
('4e097d8c-8c67-4492-ba00-3ba1bc3201fc', '2025-11-29 17:51:12.000000', '2025-11-29 17:51:12.000000', NULL, b'1', NULL, 'SEMESTER_4', '92175178-61d9-49b8-a709-ce854079ec59', '21fcf033-5dbf-4beb-987c-8b74bfca091d'),
('59bf5f5b-de20-4fd4-8be7-8822cca51804', '2025-11-29 17:52:13.000000', '2025-11-29 17:52:13.000000', NULL, b'1', NULL, 'SEMESTER_1', 'deae954e-7c8b-4ae4-909d-37db0b6ba447', 'b3b62020-6d61-4613-8ce3-fff0e0d3c6bb'),
('5c573dc5-2759-4458-a53d-62d2386bd483', '2025-11-29 17:51:16.000000', '2025-11-29 17:51:16.000000', NULL, b'1', NULL, 'SEMESTER_4', 'a28e1d5c-e74b-4fc4-93b7-845c51190fde', '5091d08f-e035-437b-aa31-a6d8b0645f54'),
('64218b8b-55e6-48a0-83d3-e54866caed76', '2025-11-29 17:51:08.000000', '2025-11-29 17:51:08.000000', NULL, b'1', NULL, 'SEMESTER_1', 'a19aa8bd-3f10-47ac-b3d4-b750244f3201', '08667b11-fe06-4187-a624-d2e9e9efa06b'),
('6b7dac43-ada4-47ff-8521-7bcda275d28a', '2025-11-29 17:51:25.000000', '2025-11-29 17:51:25.000000', NULL, b'1', NULL, 'SEMESTER_4', '085f6318-fb58-40e3-8dc3-8988c834ff11', '7d0458fd-dc6c-4d4c-835c-f0a7fe16f30a'),
('6bb10257-4871-4a34-b2db-722b70456980', '2025-11-29 17:51:16.000000', '2025-11-29 17:51:16.000000', NULL, b'1', NULL, 'SEMESTER_2', 'f43a3bf8-05f9-4a53-8d3a-78a78e82f9c8', '5091d08f-e035-437b-aa31-a6d8b0645f54'),
('6f68fdb7-ab8d-4f04-9d27-ec0c93a45623', '2025-11-29 17:51:12.000000', '2025-11-29 17:51:12.000000', NULL, b'1', NULL, 'SEMESTER_4', '1340c1ef-80b8-4d58-91ea-b829f037839f', '21fcf033-5dbf-4beb-987c-8b74bfca091d'),
('6fa2d0de-1269-439f-9c9b-39de656c3a91', '2025-11-29 17:51:08.000000', '2025-11-29 17:51:08.000000', NULL, b'1', NULL, 'SEMESTER_1', '40623d09-129a-4fb4-ac39-c5e9adf15355', '08667b11-fe06-4187-a624-d2e9e9efa06b'),
('705d52d8-1717-4c22-9338-a7260af22af6', '2025-11-29 17:51:12.000000', '2025-11-29 17:51:12.000000', NULL, b'1', NULL, 'SEMESTER_4', '19ce87bb-00ac-46eb-9ec8-f23d4921af58', '21fcf033-5dbf-4beb-987c-8b74bfca091d'),
('70ad78e8-6d72-4c3d-9520-9a3d2eae1367', '2025-11-29 17:51:16.000000', '2025-11-29 17:51:16.000000', NULL, b'1', NULL, 'SEMESTER_1', '247b7dc1-fda3-44df-aa56-1edc2f2c802b', '5091d08f-e035-437b-aa31-a6d8b0645f54'),
('7156eb1e-80d8-4576-a47e-76fa061ecd18', '2025-11-29 17:51:12.000000', '2025-11-29 17:51:12.000000', NULL, b'1', NULL, 'SEMESTER_2', 'fa58accf-8e05-43d7-ad37-a12ebcb9df8e', '21fcf033-5dbf-4beb-987c-8b74bfca091d'),
('74c1ec3b-c5c7-453b-991a-5616787eae11', '2025-11-29 17:51:16.000000', '2025-11-29 17:51:16.000000', NULL, b'1', NULL, 'SEMESTER_2', '0e885ab3-7a31-405a-8dc8-8d75e6b3039e', '5091d08f-e035-437b-aa31-a6d8b0645f54'),
('77e93796-b4bc-451c-8973-5f570c0eabb3', '2025-11-29 17:51:25.000000', '2025-11-29 17:51:25.000000', NULL, b'1', NULL, 'SEMESTER_3', 'a640a815-7225-49c8-a5c0-47fda2cc31e4', '7d0458fd-dc6c-4d4c-835c-f0a7fe16f30a'),
('78f5c005-22fd-4e24-9f59-4ef33516c82b', '2025-11-29 17:51:25.000000', '2025-11-29 17:51:25.000000', NULL, b'1', NULL, 'SEMESTER_3', '0b0e2371-548f-4bbb-9b91-a39771938469', '7d0458fd-dc6c-4d4c-835c-f0a7fe16f30a'),
('791261e5-9113-4e88-afdd-ac54610bd5fc', '2025-11-29 17:51:25.000000', '2025-11-29 17:51:25.000000', NULL, b'1', NULL, 'SEMESTER_3', '34fa45d4-8c52-4719-9085-d2e52e4e24c4', '7d0458fd-dc6c-4d4c-835c-f0a7fe16f30a'),
('79507ba8-8648-4de2-a022-79a9f2b57890', '2025-11-29 17:51:16.000000', '2025-11-29 17:51:16.000000', NULL, b'1', NULL, 'SEMESTER_4', 'b115ef8c-cf27-4b69-8ef5-d28e0e4b056f', '5091d08f-e035-437b-aa31-a6d8b0645f54'),
('7ca19143-508d-4be0-ac73-ebad717ccc9a', '2025-11-29 17:51:16.000000', '2025-11-29 17:51:16.000000', NULL, b'1', NULL, 'SEMESTER_4', '832d4d98-f0a5-49e2-9d5c-9b05df56d837', '5091d08f-e035-437b-aa31-a6d8b0645f54'),
('7ddfe669-919a-4f9a-9bcc-9b4724e04a3a', '2025-11-29 17:51:25.000000', '2025-11-29 17:51:25.000000', NULL, b'1', NULL, 'SEMESTER_3', '43e85690-24db-4028-b9d1-4cdc90dcf81f', '7d0458fd-dc6c-4d4c-835c-f0a7fe16f30a'),
('7fdcb563-3f66-4253-9eaf-cc81fcc76495', '2025-11-29 17:51:25.000000', '2025-11-29 17:51:25.000000', NULL, b'1', NULL, 'SEMESTER_4', '94137603-beac-4adc-bf08-b9b61b485f9d', '7d0458fd-dc6c-4d4c-835c-f0a7fe16f30a'),
('800d1eff-513c-40ba-8f8c-6f3ce54887c3', '2025-11-29 17:52:13.000000', '2025-11-29 17:52:13.000000', NULL, b'1', NULL, 'SEMESTER_1', '3d46318a-79ab-4da4-b08d-e342cd3d8d6f', 'b3b62020-6d61-4613-8ce3-fff0e0d3c6bb'),
('80ac304f-62f2-4bcb-a132-19cafd759f35', '2025-11-29 17:51:16.000000', '2025-11-29 17:51:16.000000', NULL, b'1', NULL, 'SEMESTER_4', 'c28f1867-43aa-41b3-ab24-1edf92ab9a5a', '5091d08f-e035-437b-aa31-a6d8b0645f54'),
('829c9061-a2cb-4246-afe9-69510f125155', '2025-11-29 17:51:11.000000', '2025-11-29 17:51:11.000000', NULL, b'1', NULL, 'SEMESTER_1', '7114f9d9-6f64-467c-8a82-df51cd1f9291', '21fcf033-5dbf-4beb-987c-8b74bfca091d'),
('857b9a2d-9e39-4c3a-8a44-3cf241b1870d', '2025-11-29 17:51:16.000000', '2025-11-29 17:51:16.000000', NULL, b'1', NULL, 'SEMESTER_1', '4a79577c-73f7-4a7f-94ab-e972cfb47b91', '5091d08f-e035-437b-aa31-a6d8b0645f54'),
('8f636969-b003-4697-b743-c25215a62be1', '2025-11-29 17:51:16.000000', '2025-11-29 17:51:16.000000', NULL, b'1', NULL, 'SEMESTER_2', 'd349b21a-a567-4579-a72a-d99b1d706381', '5091d08f-e035-437b-aa31-a6d8b0645f54'),
('8fae7b7b-b279-4f11-88bc-36df313f2451', '2025-11-29 17:51:25.000000', '2025-11-29 17:51:25.000000', NULL, b'1', NULL, 'SEMESTER_4', '1152fa39-8e11-4856-8166-fd041cd7eacc', '7d0458fd-dc6c-4d4c-835c-f0a7fe16f30a'),
('912b095e-c4ba-4270-b8aa-d9d2ba903149', '2025-11-29 17:51:12.000000', '2025-11-29 17:51:12.000000', NULL, b'1', NULL, 'SEMESTER_2', '1055a95e-976f-441a-9716-d887f8fe7bd4', '21fcf033-5dbf-4beb-987c-8b74bfca091d'),
('92507296-1901-4d97-aea1-95c3d78c8894', '2025-11-29 17:51:12.000000', '2025-11-29 17:51:12.000000', NULL, b'1', NULL, 'SEMESTER_2', 'a721787a-f831-4362-a607-9bbab8e594b5', '21fcf033-5dbf-4beb-987c-8b74bfca091d'),
('94216dd0-c037-4ede-baaa-a90cdb1d5d34', '2025-11-29 17:51:11.000000', '2025-11-29 17:51:11.000000', NULL, b'1', NULL, 'SEMESTER_1', '19d27a02-6561-47aa-a66b-00f7a5bd9721', '21fcf033-5dbf-4beb-987c-8b74bfca091d'),
('94ba1c43-d4b0-4fc4-b8ef-640a517693a0', '2025-11-29 17:51:25.000000', '2025-11-29 17:51:25.000000', NULL, b'1', NULL, 'SEMESTER_3', 'a746891d-a6fb-432b-a149-d0e6d22f5395', '7d0458fd-dc6c-4d4c-835c-f0a7fe16f30a'),
('9a28a500-7b1d-45e7-85b5-50e7a11e4444', '2025-11-29 17:51:08.000000', '2025-11-29 17:51:08.000000', NULL, b'1', NULL, 'SEMESTER_1', '2ab4ac69-7f6c-43eb-9bd7-6e1d147e75cc', '08667b11-fe06-4187-a624-d2e9e9efa06b'),
('9aab8070-f85c-4936-ab51-fac55762d584', '2025-11-29 17:51:24.000000', '2025-11-29 17:51:24.000000', NULL, b'1', NULL, 'SEMESTER_1', 'd3285fd3-031e-4d7f-a84d-6ea96fd1d190', '7d0458fd-dc6c-4d4c-835c-f0a7fe16f30a'),
('9b0dd174-98c3-4d70-8b5b-1563bda519a6', '2025-11-29 17:51:25.000000', '2025-11-29 17:51:25.000000', NULL, b'1', NULL, 'SEMESTER_2', '9f8149ee-0012-4261-b4e5-d9470f12529f', '7d0458fd-dc6c-4d4c-835c-f0a7fe16f30a'),
('9eaa4d6d-c7ac-4888-bcf2-ab8641e31d26', '2025-11-29 17:51:12.000000', '2025-11-29 17:51:12.000000', NULL, b'1', NULL, 'SEMESTER_3', 'ba76e09f-9f32-45e9-a2e7-a30f40ebc51a', '21fcf033-5dbf-4beb-987c-8b74bfca091d'),
('9eea7a50-96ec-427c-8034-d6c0357b48d8', '2025-11-29 17:51:12.000000', '2025-11-29 17:51:12.000000', NULL, b'1', NULL, 'SEMESTER_2', '7549ccbb-7f37-4a76-a2c4-3278df2cd142', '21fcf033-5dbf-4beb-987c-8b74bfca091d'),
('a0cc21f0-407c-41ab-bcd2-df0f89c883b9', '2025-11-29 17:51:25.000000', '2025-11-29 17:51:25.000000', NULL, b'1', NULL, 'SEMESTER_3', '2b225a92-603d-4356-8ace-a80b77b13647', '7d0458fd-dc6c-4d4c-835c-f0a7fe16f30a'),
('a3f8b796-3e88-4769-a03e-81abf5818a80', '2025-11-29 17:51:16.000000', '2025-11-29 17:51:16.000000', NULL, b'1', NULL, 'SEMESTER_3', 'a0cc015d-6d95-40b3-96fe-6c1cc51c9f44', '5091d08f-e035-437b-aa31-a6d8b0645f54'),
('a963772d-dff1-462e-a786-59a6d6c8531d', '2025-11-29 17:51:16.000000', '2025-11-29 17:51:16.000000', NULL, b'1', NULL, 'SEMESTER_2', '5b6f8a6d-7bf6-449f-9b52-f3dbb182d7e3', '5091d08f-e035-437b-aa31-a6d8b0645f54'),
('adf11ae3-7698-43a8-a677-30aeafbae946', '2025-11-29 17:51:24.000000', '2025-11-29 17:51:24.000000', NULL, b'1', NULL, 'SEMESTER_1', '12cfa8ea-b588-4ef0-850c-f7ee1cd3b67e', '7d0458fd-dc6c-4d4c-835c-f0a7fe16f30a'),
('ae7c3e57-3c89-4e23-88d3-063b3ac02be0', '2025-11-29 17:51:16.000000', '2025-11-29 17:51:16.000000', NULL, b'1', NULL, 'SEMESTER_3', 'ac27543d-8558-4861-a312-8e9da3eb725c', '5091d08f-e035-437b-aa31-a6d8b0645f54'),
('b4b2add3-2cd5-4a3f-b49d-271a3d7ef6fb', '2025-11-29 17:51:16.000000', '2025-11-29 17:51:16.000000', NULL, b'1', NULL, 'SEMESTER_3', '52a9a97e-8c8b-4e37-9aaf-b63e9c749ae3', '5091d08f-e035-437b-aa31-a6d8b0645f54'),
('b8c7c6a0-73d6-44e4-80d5-d4ea976f2986', '2025-11-29 17:51:24.000000', '2025-11-29 17:51:24.000000', NULL, b'1', NULL, 'SEMESTER_1', '62cfef0d-2ca4-46fb-b0ab-1e8884eaa804', '7d0458fd-dc6c-4d4c-835c-f0a7fe16f30a'),
('b9368047-a567-4ed9-b485-4bd5a88ad5a3', '2025-11-29 17:52:13.000000', '2025-11-29 17:52:13.000000', NULL, b'1', NULL, 'SEMESTER_1', '4efec550-ab86-48c9-abf3-33c3e65f4212', 'b3b62020-6d61-4613-8ce3-fff0e0d3c6bb'),
('bb42888d-414e-4c20-8e3b-503ebf8e1ee2', '2025-11-29 17:51:08.000000', '2025-11-29 17:51:08.000000', NULL, b'1', NULL, 'SEMESTER_1', 'e9f55bac-88a8-4ac2-a8c6-daeff8bc1fb9', '08667b11-fe06-4187-a624-d2e9e9efa06b'),
('bbb5d8d0-1525-4175-8619-00767dfe5ef0', '2025-11-29 17:51:12.000000', '2025-11-29 17:51:12.000000', NULL, b'1', NULL, 'SEMESTER_4', '21301704-9dd7-46a7-8788-d5fbaaf2ae35', '21fcf033-5dbf-4beb-987c-8b74bfca091d'),
('bf0faca8-32a8-41df-8cdd-1414366bb5b9', '2025-11-29 17:51:16.000000', '2025-11-29 17:51:16.000000', NULL, b'1', NULL, 'SEMESTER_3', '59c29add-875b-4f2e-928a-d86e74c298bf', '5091d08f-e035-437b-aa31-a6d8b0645f54'),
('c22cbf9e-5d0a-4fd1-afc7-0563bdcad93e', '2025-11-29 17:51:25.000000', '2025-11-29 17:51:25.000000', NULL, b'1', NULL, 'SEMESTER_4', 'afebff81-96d4-480b-9bd1-cfcbd2ac7f7e', '7d0458fd-dc6c-4d4c-835c-f0a7fe16f30a'),
('c4580fd3-ad81-467b-a057-0d39c73d25de', '2025-11-29 17:51:25.000000', '2025-11-29 17:51:25.000000', NULL, b'1', NULL, 'SEMESTER_2', 'd3dfe0ca-a120-48de-9d52-3adb4ba5bd24', '7d0458fd-dc6c-4d4c-835c-f0a7fe16f30a'),
('c70c1daa-1108-4f27-b1a4-e4551fdbc54a', '2025-11-29 17:51:25.000000', '2025-11-29 17:51:25.000000', NULL, b'1', NULL, 'SEMESTER_3', 'b8f339f8-c249-4b74-9c23-946c6ecde5b4', '7d0458fd-dc6c-4d4c-835c-f0a7fe16f30a'),
('caa8689d-2f4d-4610-a24e-0a1cf8621e22', '2025-11-29 17:51:16.000000', '2025-11-29 17:51:16.000000', NULL, b'1', NULL, 'SEMESTER_1', '35d9629c-4dd3-4aa7-b418-ea78a7ee3674', '5091d08f-e035-437b-aa31-a6d8b0645f54'),
('d04886d7-beed-4c50-b6ba-77405d6c0a58', '2025-11-29 17:51:12.000000', '2025-11-29 17:51:12.000000', NULL, b'1', NULL, 'SEMESTER_3', '30f27eaf-b71c-4f0e-81bb-ce18d2a8052d', '21fcf033-5dbf-4beb-987c-8b74bfca091d'),
('d318a2aa-b265-42e0-a3f2-78221795ad74', '2025-11-29 17:51:12.000000', '2025-11-29 17:51:12.000000', NULL, b'1', NULL, 'SEMESTER_4', 'e02ac708-3c51-49ad-bd61-09789126af18', '21fcf033-5dbf-4beb-987c-8b74bfca091d'),
('d37eb301-1178-4baf-8f05-8928b5b7c7b5', '2025-11-29 17:51:25.000000', '2025-11-29 17:51:25.000000', NULL, b'1', NULL, 'SEMESTER_4', 'e918b4a2-3b96-4bbe-888f-530d5df4079b', '7d0458fd-dc6c-4d4c-835c-f0a7fe16f30a'),
('d6f5a482-e31e-43f6-b100-237500a4b3b6', '2025-11-29 17:51:08.000000', '2025-11-29 17:51:08.000000', NULL, b'1', NULL, 'SEMESTER_1', 'a1cd5b3c-45d1-4a17-9082-a0ce6634a5fc', '08667b11-fe06-4187-a624-d2e9e9efa06b'),
('d95084be-c4c4-4745-88fb-95889f4990e7', '2025-11-29 17:51:16.000000', '2025-11-29 17:51:16.000000', NULL, b'1', NULL, 'SEMESTER_3', '28b31050-2d6b-491b-b4c4-348b8d1a2a99', '5091d08f-e035-437b-aa31-a6d8b0645f54'),
('d996da30-a6ed-4dd3-9c21-cb12f83025fc', '2025-11-29 17:52:13.000000', '2025-11-29 17:52:13.000000', NULL, b'1', NULL, 'SEMESTER_1', '352bc806-b106-4445-bd93-43beae080cd4', 'b3b62020-6d61-4613-8ce3-fff0e0d3c6bb'),
('da4eda9c-41b6-48a9-81e1-efa3f7421a32', '2025-11-29 17:51:16.000000', '2025-11-29 17:51:16.000000', NULL, b'1', NULL, 'SEMESTER_4', 'fd278f13-d279-4b09-8222-ff90024b6921', '5091d08f-e035-437b-aa31-a6d8b0645f54'),
('db1af873-6745-4783-977e-d337b5f310d6', '2025-11-29 17:51:12.000000', '2025-11-29 17:51:12.000000', NULL, b'1', NULL, 'SEMESTER_3', 'bf80cf4a-53bc-4862-b8cb-a06c56447563', '21fcf033-5dbf-4beb-987c-8b74bfca091d'),
('dbcd43e8-6058-49e1-ac3f-4c9c2b92449c', '2025-11-29 17:51:24.000000', '2025-11-29 17:51:24.000000', NULL, b'1', NULL, 'SEMESTER_1', 'a6dccf0e-d205-4d7e-baa7-b54e1633f975', '7d0458fd-dc6c-4d4c-835c-f0a7fe16f30a'),
('dc80bfe5-43c8-4086-8d28-b22fb4c97568', '2025-11-29 17:51:25.000000', '2025-11-29 17:51:25.000000', NULL, b'1', NULL, 'SEMESTER_2', '87d9ad5c-ba74-4cb4-91b7-bb4941646c9c', '7d0458fd-dc6c-4d4c-835c-f0a7fe16f30a'),
('e143a017-f053-409f-812a-5ca5a07c5fd5', '2025-11-29 17:51:12.000000', '2025-11-29 17:51:12.000000', NULL, b'1', NULL, 'SEMESTER_1', 'b4a10b39-e87c-4db2-8b59-3d11e8ce0543', '21fcf033-5dbf-4beb-987c-8b74bfca091d'),
('e1d844bd-b848-453e-b9c8-8f4f60e0e466', '2025-11-29 17:51:16.000000', '2025-11-29 17:51:16.000000', NULL, b'1', NULL, 'SEMESTER_2', '9a2a1edd-291e-439e-92c2-c57fe1f52256', '5091d08f-e035-437b-aa31-a6d8b0645f54'),
('e6473e61-c940-4343-bead-233fcfb2024c', '2025-11-29 17:51:16.000000', '2025-11-29 17:51:16.000000', NULL, b'1', NULL, 'SEMESTER_4', '75c2f038-ffe9-4ebf-8202-d4b24530f569', '5091d08f-e035-437b-aa31-a6d8b0645f54'),
('e8bd7d12-bb38-4500-8e89-9b4aec05a972', '2025-11-29 17:51:25.000000', '2025-11-29 17:51:25.000000', NULL, b'1', NULL, 'SEMESTER_3', 'ad1c8e8c-8c53-461b-a52f-7b994d220202', '7d0458fd-dc6c-4d4c-835c-f0a7fe16f30a'),
('ede7c2af-4c57-484b-a5e7-1881e8ac837b', '2025-11-29 17:51:16.000000', '2025-11-29 17:51:16.000000', NULL, b'1', NULL, 'SEMESTER_3', '3698a89c-7f13-4c0b-a053-315516e901be', '5091d08f-e035-437b-aa31-a6d8b0645f54'),
('ef8716ba-8e0c-47ce-a67b-7de17a0a59a0', '2025-11-29 17:51:16.000000', '2025-11-29 17:51:16.000000', NULL, b'1', NULL, 'SEMESTER_1', 'd67a8233-ae8d-4fdd-9a2d-c90b2eedf9a3', '5091d08f-e035-437b-aa31-a6d8b0645f54'),
('f387b020-89f3-410b-a57f-0bea41c1f631', '2025-11-29 17:51:25.000000', '2025-11-29 17:51:25.000000', NULL, b'1', NULL, 'SEMESTER_2', 'd0fdfcce-aec8-425b-858b-74997972f492', '7d0458fd-dc6c-4d4c-835c-f0a7fe16f30a'),
('f3ad0b62-d95b-4dea-b627-f7e0ef81aeec', '2025-11-29 17:51:12.000000', '2025-11-29 17:51:12.000000', NULL, b'1', NULL, 'SEMESTER_2', '7bd63939-8637-48d0-8dee-2aceed875537', '21fcf033-5dbf-4beb-987c-8b74bfca091d'),
('f3dceaa6-3c21-4f36-b017-e566b679784c', '2025-11-29 17:52:13.000000', '2025-11-29 17:52:13.000000', NULL, b'1', NULL, 'SEMESTER_1', 'fabfc6f7-860a-445c-b8bf-01b6dd3d7ae6', 'b3b62020-6d61-4613-8ce3-fff0e0d3c6bb'),
('f4356404-6cf8-4b7d-8702-8f638a5d573a', '2025-11-29 17:51:16.000000', '2025-11-29 17:51:16.000000', NULL, b'1', NULL, 'SEMESTER_1', 'd43e24fa-df0e-49e7-b3f5-9049a0c0ed58', '5091d08f-e035-437b-aa31-a6d8b0645f54'),
('f490adea-5cb8-421f-9aac-0f5752087c2b', '2025-11-29 17:51:16.000000', '2025-11-29 17:51:16.000000', NULL, b'1', NULL, 'SEMESTER_4', '85c59689-bc6f-4f3d-8d3c-8c5e549939fc', '5091d08f-e035-437b-aa31-a6d8b0645f54'),
('f549c5b5-aec5-4a09-8c93-a30438b4a503', '2025-11-29 17:51:08.000000', '2025-11-29 17:51:08.000000', NULL, b'1', NULL, 'SEMESTER_1', 'fc2b75f5-43d0-4539-9c2e-87ea97ca6311', '08667b11-fe06-4187-a624-d2e9e9efa06b'),
('f900dddf-f1af-4b2f-b2e4-1772c511c0c8', '2025-11-29 17:51:25.000000', '2025-11-29 17:51:25.000000', NULL, b'1', NULL, 'SEMESTER_4', 'b83dcd03-225d-44e1-ae4e-9ae9ae140bf7', '7d0458fd-dc6c-4d4c-835c-f0a7fe16f30a'),
('fba6bfcf-ef8a-4697-a41d-7de9873ddc05', '2025-11-29 17:52:13.000000', '2025-11-29 17:52:13.000000', NULL, b'1', NULL, 'SEMESTER_1', 'a1023450-666f-4da3-89be-f181157c9e13', 'b3b62020-6d61-4613-8ce3-fff0e0d3c6bb'),
('fbc8d6d5-2acc-49c3-879f-bc275a3faee8', '2025-11-29 17:51:25.000000', '2025-11-29 17:51:25.000000', NULL, b'1', NULL, 'SEMESTER_3', 'f12df044-c774-4b75-ae24-e74541999359', '7d0458fd-dc6c-4d4c-835c-f0a7fe16f30a'),
('fea40ea4-2649-44ea-83e9-644ef9be99e2', '2025-11-29 17:51:25.000000', '2025-11-29 17:51:25.000000', NULL, b'1', NULL, 'SEMESTER_4', '5c71fddc-70c2-4990-87a8-99a392f5fed8', '7d0458fd-dc6c-4d4c-835c-f0a7fe16f30a'),
('ff3bfeaa-77f1-4f14-8fef-d90f133f60e3', '2025-11-29 17:51:11.000000', '2025-11-29 17:51:11.000000', NULL, b'1', NULL, 'SEMESTER_1', '8441b15d-cf6c-4ae1-b111-b9cff6ec062c', '21fcf033-5dbf-4beb-987c-8b74bfca091d'),
('ffc667c0-76d0-4297-94fa-ec60d9d9a93d', '2025-11-29 17:51:12.000000', '2025-11-29 17:51:12.000000', NULL, b'1', NULL, 'SEMESTER_3', 'f7f05203-a872-4203-84f1-0f6f09bcf432', '21fcf033-5dbf-4beb-987c-8b74bfca091d');

-- --------------------------------------------------------

--
-- Table structure for table `teaching_assignments`
--

CREATE TABLE `teaching_assignments` (
  `id` varchar(255) NOT NULL,
  `creation_timestamp` datetime(6) DEFAULT NULL,
  `update_timestamp` datetime(6) DEFAULT NULL,
  `assigned_at` datetime(6) NOT NULL,
  `completed_at` datetime(6) DEFAULT NULL,
  `failure_reason` text DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `status` enum('ASSIGNED','COMPLETED','NOT_COMPLETED','FAILED') NOT NULL,
  `assigned_by` varchar(255) DEFAULT NULL,
  `class_id` varchar(255) NOT NULL,
  `teacher_id` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `trial_attendees`
--

CREATE TABLE `trial_attendees` (
  `id` varchar(255) NOT NULL,
  `creation_timestamp` datetime(6) DEFAULT NULL,
  `update_timestamp` datetime(6) DEFAULT NULL,
  `attendee_name` varchar(100) DEFAULT NULL,
  `attendee_role` enum('CHU_TOA','THU_KY','THANH_VIEN') DEFAULT NULL,
  `attendee_user_id` varchar(255) DEFAULT NULL,
  `trial_id` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `trial_evaluations`
--

CREATE TABLE `trial_evaluations` (
  `id` varchar(255) NOT NULL,
  `creation_timestamp` datetime(6) DEFAULT NULL,
  `update_timestamp` datetime(6) DEFAULT NULL,
  `comments` text DEFAULT NULL,
  `conclusion` enum('PASS','FAIL') NOT NULL,
  `score` int(11) NOT NULL,
  `attendee_id` varchar(255) DEFAULT NULL,
  `image_file_id` varchar(255) DEFAULT NULL,
  `trial_id` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `trial_evaluation_items`
--

CREATE TABLE `trial_evaluation_items` (
  `id` varchar(255) NOT NULL,
  `creation_timestamp` datetime(6) DEFAULT NULL,
  `update_timestamp` datetime(6) DEFAULT NULL,
  `comment` text DEFAULT NULL,
  `criterion_code` varchar(20) NOT NULL,
  `criterion_label` text DEFAULT NULL,
  `order_index` int(11) DEFAULT NULL,
  `score` int(11) NOT NULL,
  `evaluation_id` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `trial_teachings`
--

CREATE TABLE `trial_teachings` (
  `id` varchar(255) NOT NULL,
  `creation_timestamp` datetime(6) DEFAULT NULL,
  `update_timestamp` datetime(6) DEFAULT NULL,
  `admin_override` bit(1) DEFAULT NULL,
  `average_score` int(11) DEFAULT NULL,
  `final_result` enum('PASS','FAIL') DEFAULT NULL,
  `has_red_flag` bit(1) DEFAULT NULL,
  `location` varchar(100) DEFAULT NULL,
  `needs_review` bit(1) DEFAULT NULL,
  `note` text DEFAULT NULL,
  `result_note` text DEFAULT NULL,
  `status` enum('PENDING','REVIEWED','PASSED','FAILED') NOT NULL,
  `teaching_date` date NOT NULL,
  `teaching_time` varchar(255) DEFAULT NULL,
  `aptech_exam_id` varchar(255) DEFAULT NULL,
  `subject_id` varchar(255) NOT NULL,
  `teacher_id` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` varchar(255) NOT NULL,
  `creation_timestamp` datetime(6) DEFAULT NULL,
  `update_timestamp` datetime(6) DEFAULT NULL,
  `academic_rank` varchar(255) DEFAULT NULL,
  `active` enum('ACTIVE','INACTIVE') DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `primary_role` enum('MANAGE','TEACHER') DEFAULT NULL,
  `teacher_code` varchar(20) DEFAULT NULL,
  `about_me` varchar(255) DEFAULT NULL,
  `birth_date` datetime(6) DEFAULT NULL,
  `country` varchar(255) DEFAULT NULL,
  `district` varchar(255) DEFAULT NULL,
  `first_name` varchar(255) DEFAULT NULL,
  `gender` tinyint(4) DEFAULT NULL,
  `house_number` varchar(255) DEFAULT NULL,
  `image_cover_url` varchar(255) DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `last_name` varchar(255) DEFAULT NULL,
  `phone_number` varchar(255) DEFAULT NULL,
  `province` varchar(255) DEFAULT NULL,
  `qualification` varchar(255) DEFAULT NULL,
  `ward` varchar(255) DEFAULT NULL,
  `username` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `creation_timestamp`, `update_timestamp`, `academic_rank`, `active`, `email`, `password`, `primary_role`, `teacher_code`, `about_me`, `birth_date`, `country`, `district`, `first_name`, `gender`, `house_number`, `image_cover_url`, `image_url`, `last_name`, `phone_number`, `province`, `qualification`, `ward`, `username`) VALUES
('1', NULL, '2025-11-29 17:49:46.000000', NULL, 'ACTIVE', 'nguyentrungthuan417@gmail.com', '1', 'MANAGE', 'TC0001', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Nguyễn Trung Thuận'),
('2', NULL, '2025-11-29 17:49:53.000000', NULL, 'ACTIVE', 'ntthuana23127@cusc.ctu.edu.vn', '1', 'TEACHER', 'TC0002', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Nguyễn Trung Thuận'),
('e785b8b6-a1bf-4ec8-98fd-b343e1eeb5c8', '2025-11-29 17:53:59.000000', '2025-11-29 17:53:59.000000', NULL, 'ACTIVE', 'trannhatanh@gmail.com', '$2a$10$M2Qn3Z70BDb7Z1LDHLBLN.3imIdyvn.qW0KKKaGjWOXUQyW1doM26', 'TEACHER', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Trần Nhật Anh');

-- --------------------------------------------------------

--
-- Table structure for table `users_skills`
--

CREATE TABLE `users_skills` (
  `users_id` varchar(255) NOT NULL,
  `skills` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user_roles`
--

CREATE TABLE `user_roles` (
  `user_id` varchar(255) NOT NULL,
  `role` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_roles`
--

INSERT INTO `user_roles` (`user_id`, `role`) VALUES
('e785b8b6-a1bf-4ec8-98fd-b343e1eeb5c8', 'TEACHER');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `aptech_exams`
--
ALTER TABLE `aptech_exams`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `UQ_Exam_Session_Teacher_Subject_Attempt` (`session_id`,`teacher_id`,`subject_id`,`attempt`),
  ADD UNIQUE KEY `UQ_Exam_Teacher_Subject_Attempt` (`teacher_id`,`subject_id`,`attempt`),
  ADD KEY `idx_teacher_subject` (`teacher_id`,`subject_id`),
  ADD KEY `idx_result` (`result`),
  ADD KEY `FKn3v89ygc4bbvo4dysfd4oycov` (`certificate_file_id`),
  ADD KEY `FK5khwqxrh0j200codu7drvlm84` (`exam_proof_file_id`),
  ADD KEY `FKpj8xjdf6de665nkufjtx89kpt` (`subject_id`);

--
-- Indexes for table `aptech_exam_sessions`
--
ALTER TABLE `aptech_exam_sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_exam_date` (`exam_date`);

--
-- Indexes for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_entity_id` (`entity`,`entity_id`),
  ADD KEY `idx_actor_user` (`actor_user_id`),
  ADD KEY `idx_creation_timestamp` (`creation_timestamp`);

--
-- Indexes for table `evidence`
--
ALTER TABLE `evidence`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_teacher_subject_date` (`teacher_id`,`subject_id`,`submitted_date`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_verified_by` (`verified_by`),
  ADD KEY `idx_verified_at` (`verified_at`),
  ADD KEY `FKlxwt3gyvus28ntb2vrpnkquio` (`file_id`),
  ADD KEY `FKlhoyq21jw1lw0tu67vtgco90r` (`subject_id`);

--
-- Indexes for table `files`
--
ALTER TABLE `files`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_type` (`type`),
  ADD KEY `idx_uploaded_by` (`uploaded_by`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_read` (`user_id`,`is_read`),
  ADD KEY `idx_type` (`type`),
  ADD KEY `idx_creation_timestamp` (`creation_timestamp`);

--
-- Indexes for table `reports`
--
ALTER TABLE `reports`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_teacher_year_quarter` (`teacher_id`,`year`,`quarter`),
  ADD KEY `idx_report_type` (`report_type`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `FK3r1u0rg5dujg5hfxf6y4kshv8` (`file_id`),
  ADD KEY `FK6oup43skcuxmgopql1obft8lo` (`generated_by`);

--
-- Indexes for table `schedule_classes`
--
ALTER TABLE `schedule_classes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `UK_ddkuykel1c5sat73beak0s3ro` (`class_code`),
  ADD KEY `idx_class_code` (`class_code`),
  ADD KEY `idx_subject_id` (`subject_id`),
  ADD KEY `idx_year_quarter` (`year`,`quarter`);

--
-- Indexes for table `schedule_slots`
--
ALTER TABLE `schedule_slots`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FKbbsubfafddaqhfoyrpotafbsj` (`schedule_class_id`);

--
-- Indexes for table `skills`
--
ALTER TABLE `skills`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_skill_code` (`skill_code`),
  ADD KEY `idx_skill_code` (`skill_code`),
  ADD KEY `idx_skill_is_active` (`is_active`);

--
-- Indexes for table `subjects`
--
ALTER TABLE `subjects`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `UK_gc99fcjumra0b9onucg6jvtje` (`image_subject`),
  ADD KEY `idx_subject_name` (`subject_name`),
  ADD KEY `idx_system_id` (`system_id`),
  ADD KEY `idx_is_active` (`is_active`),
  ADD KEY `idx_skill_id` (`skill_id`);

--
-- Indexes for table `subject_registrations`
--
ALTER TABLE `subject_registrations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `UQ_SubjectRegistration` (`teacher_id`,`subject_id`,`year`,`quarter`),
  ADD KEY `idx_teacher_year_quarter` (`teacher_id`,`year`,`quarter`),
  ADD KEY `idx_subject_year_quarter` (`subject_id`,`year`,`quarter`),
  ADD KEY `idx_year_quarter` (`year`,`quarter`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `subject_systems`
--
ALTER TABLE `subject_systems`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `UK_5d6ys53r6jn2dtt1o8htbfa13` (`system_code`),
  ADD KEY `idx_system_code` (`system_code`),
  ADD KEY `idx_is_active` (`is_active`);

--
-- Indexes for table `subject_system_assignments`
--
ALTER TABLE `subject_system_assignments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_subject_system` (`subject_id`,`system_id`),
  ADD KEY `idx_assignment_subject` (`subject_id`),
  ADD KEY `idx_assignment_system` (`system_id`);

--
-- Indexes for table `teaching_assignments`
--
ALTER TABLE `teaching_assignments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FKdfk2ifgn98csuwv819dh6kd0` (`assigned_by`),
  ADD KEY `FKrav4gh483g1uxw6trqcqyw3y` (`class_id`),
  ADD KEY `FK5ei7j09hqhq92dbfccqm6yvvo` (`teacher_id`);

--
-- Indexes for table `trial_attendees`
--
ALTER TABLE `trial_attendees`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_trial_id` (`trial_id`),
  ADD KEY `FKhwswjvfe7abbk5kbeqe9q0mqw` (`attendee_user_id`);

--
-- Indexes for table `trial_evaluations`
--
ALTER TABLE `trial_evaluations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_attendee_id` (`attendee_id`),
  ADD KEY `idx_trial_id` (`trial_id`),
  ADD KEY `FKs3sorhquf7rbo4drlvsc2v0kt` (`image_file_id`);

--
-- Indexes for table `trial_evaluation_items`
--
ALTER TABLE `trial_evaluation_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_evaluation_id` (`evaluation_id`),
  ADD KEY `idx_criterion_code` (`criterion_code`);

--
-- Indexes for table `trial_teachings`
--
ALTER TABLE `trial_teachings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_teacher_subject_date` (`teacher_id`,`subject_id`,`teaching_date`),
  ADD KEY `FKb756uyc591d9xdumkuk8kecyl` (`aptech_exam_id`),
  ADD KEY `FKb6wurukh28x8xsiyvx556dimf` (`subject_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `UK_6dotkott2kjsp8vw4d0m25fb7` (`email`),
  ADD UNIQUE KEY `UK_ppvdcsb7oavmfcnqy28u0as9a` (`teacher_code`);

--
-- Indexes for table `users_skills`
--
ALTER TABLE `users_skills`
  ADD KEY `FKpld1btafd1w8na0jo61bedo3t` (`users_id`);

--
-- Indexes for table `user_roles`
--
ALTER TABLE `user_roles`
  ADD KEY `FKhfh9dx7w3ubf1co1vdev94g3f` (`user_id`);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `aptech_exams`
--
ALTER TABLE `aptech_exams`
  ADD CONSTRAINT `FK5khwqxrh0j200codu7drvlm84` FOREIGN KEY (`exam_proof_file_id`) REFERENCES `files` (`id`),
  ADD CONSTRAINT `FK6mv5p5ia6a76nolsyjtkfj3a` FOREIGN KEY (`session_id`) REFERENCES `aptech_exam_sessions` (`id`),
  ADD CONSTRAINT `FKn3v89ygc4bbvo4dysfd4oycov` FOREIGN KEY (`certificate_file_id`) REFERENCES `files` (`id`),
  ADD CONSTRAINT `FKpj8xjdf6de665nkufjtx89kpt` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`),
  ADD CONSTRAINT `FKtlauht565mrcviyh47vge63df` FOREIGN KEY (`teacher_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD CONSTRAINT `FK17vn8rhj6qver0naebk935vkk` FOREIGN KEY (`actor_user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `evidence`
--
ALTER TABLE `evidence`
  ADD CONSTRAINT `FK6ekjgsiejrqe96rkqkci6hmf1` FOREIGN KEY (`teacher_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `FKhw8ytqgbr2cqidwoicbvth6x3` FOREIGN KEY (`verified_by`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `FKlhoyq21jw1lw0tu67vtgco90r` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`),
  ADD CONSTRAINT `FKlxwt3gyvus28ntb2vrpnkquio` FOREIGN KEY (`file_id`) REFERENCES `files` (`id`);

--
-- Constraints for table `files`
--
ALTER TABLE `files`
  ADD CONSTRAINT `FKofr64lki8xvlsgrjsb84wlj8t` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`);

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `FK9y21adhxn0ayjhfocscqox7bh` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `reports`
--
ALTER TABLE `reports`
  ADD CONSTRAINT `FK3r1u0rg5dujg5hfxf6y4kshv8` FOREIGN KEY (`file_id`) REFERENCES `files` (`id`),
  ADD CONSTRAINT `FK6oup43skcuxmgopql1obft8lo` FOREIGN KEY (`generated_by`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `FKkinbg7lajt1mghdttw0v87ew4` FOREIGN KEY (`teacher_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `schedule_classes`
--
ALTER TABLE `schedule_classes`
  ADD CONSTRAINT `FKnp4aslgpn2vvekhl83rnxg956` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`);

--
-- Constraints for table `schedule_slots`
--
ALTER TABLE `schedule_slots`
  ADD CONSTRAINT `FKbbsubfafddaqhfoyrpotafbsj` FOREIGN KEY (`schedule_class_id`) REFERENCES `schedule_classes` (`id`);

--
-- Constraints for table `subjects`
--
ALTER TABLE `subjects`
  ADD CONSTRAINT `FK2b789j8esl21wjm6gatiynytf` FOREIGN KEY (`skill_id`) REFERENCES `skills` (`id`),
  ADD CONSTRAINT `FK4lgtyyhtayrnts53o64x0pcja` FOREIGN KEY (`system_id`) REFERENCES `subject_systems` (`id`),
  ADD CONSTRAINT `FKiqts12jvjkm7lgpam4j4opfy` FOREIGN KEY (`image_subject`) REFERENCES `files` (`id`);

--
-- Constraints for table `subject_registrations`
--
ALTER TABLE `subject_registrations`
  ADD CONSTRAINT `FKcuwkpdnmlgnbfvsv7dd9yyjxt` FOREIGN KEY (`teacher_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `FKhyurhiaseffdjn4kpwmq3b0wx` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`);

--
-- Constraints for table `subject_system_assignments`
--
ALTER TABLE `subject_system_assignments`
  ADD CONSTRAINT `FK9vqmlkll1w2womvkvyb59efnk` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`),
  ADD CONSTRAINT `FKd9if5hbhg0yluageojio3m9or` FOREIGN KEY (`system_id`) REFERENCES `subject_systems` (`id`);

--
-- Constraints for table `teaching_assignments`
--
ALTER TABLE `teaching_assignments`
  ADD CONSTRAINT `FK5ei7j09hqhq92dbfccqm6yvvo` FOREIGN KEY (`teacher_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `FKdfk2ifgn98csuwv819dh6kd0` FOREIGN KEY (`assigned_by`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `FKrav4gh483g1uxw6trqcqyw3y` FOREIGN KEY (`class_id`) REFERENCES `schedule_classes` (`id`);

--
-- Constraints for table `trial_attendees`
--
ALTER TABLE `trial_attendees`
  ADD CONSTRAINT `FKhwswjvfe7abbk5kbeqe9q0mqw` FOREIGN KEY (`attendee_user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `FKjj2m4vq8ixn1d7q8pyln0ncr9` FOREIGN KEY (`trial_id`) REFERENCES `trial_teachings` (`id`);

--
-- Constraints for table `trial_evaluations`
--
ALTER TABLE `trial_evaluations`
  ADD CONSTRAINT `FK31k37muro62b3mh62jdpel7yr` FOREIGN KEY (`trial_id`) REFERENCES `trial_teachings` (`id`),
  ADD CONSTRAINT `FKmehry7ab40i8y4qkxhxe82wv1` FOREIGN KEY (`attendee_id`) REFERENCES `trial_attendees` (`id`),
  ADD CONSTRAINT `FKs3sorhquf7rbo4drlvsc2v0kt` FOREIGN KEY (`image_file_id`) REFERENCES `files` (`id`);

--
-- Constraints for table `trial_evaluation_items`
--
ALTER TABLE `trial_evaluation_items`
  ADD CONSTRAINT `FKttrm9ampquw7we5a146x7iqf` FOREIGN KEY (`evaluation_id`) REFERENCES `trial_evaluations` (`id`);

--
-- Constraints for table `trial_teachings`
--
ALTER TABLE `trial_teachings`
  ADD CONSTRAINT `FKb6wurukh28x8xsiyvx556dimf` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`),
  ADD CONSTRAINT `FKb756uyc591d9xdumkuk8kecyl` FOREIGN KEY (`aptech_exam_id`) REFERENCES `aptech_exams` (`id`),
  ADD CONSTRAINT `FKc0n2tbfx3hbokl8t1a0shn1u7` FOREIGN KEY (`teacher_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `users_skills`
--
ALTER TABLE `users_skills`
  ADD CONSTRAINT `FKpld1btafd1w8na0jo61bedo3t` FOREIGN KEY (`users_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `user_roles`
--
ALTER TABLE `user_roles`
  ADD CONSTRAINT `FKhfh9dx7w3ubf1co1vdev94g3f` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
