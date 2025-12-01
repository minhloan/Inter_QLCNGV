-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Dec 01, 2025 at 03:31 PM
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
('288964ae-cbcb-4b14-b815-d7e2d406ba84', '2025-12-01 14:16:06.000000', '2025-12-01 14:16:06.000000', 'LOGIN', 'USER', '1', '{\"method\":\"GOOGLE\"}', '1'),
('8e7b8cfa-6c8d-45c0-a42d-38cca7b820ef', '2025-12-01 21:25:20.000000', '2025-12-01 21:25:20.000000', 'LOGIN', 'USER', '1', '{\"method\":\"GOOGLE\"}', '1'),
('8fdaf315-4d58-4310-a391-bc37ba106893', '2025-12-01 14:30:48.000000', '2025-12-01 14:30:48.000000', 'LOGIN', 'USER', '1', '{\"method\":\"GOOGLE\"}', '1');

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
  `is_new` bit(1) NOT NULL,
  `skill_code` varchar(50) NOT NULL,
  `skill_name` varchar(500) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `skills`
--

INSERT INTO `skills` (`id`, `creation_timestamp`, `update_timestamp`, `is_active`, `is_new`, `skill_code`, `skill_name`) VALUES
('00fcf888-b6cd-41cb-9ed6-41722c68eb5a', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '368', '368-UI/UX for Responsive Design'),
('01074951-d69d-4a83-9db9-08212e1d107c', '2025-11-30 13:31:23.000000', '2024-06-01 00:00:00.000000', b'1', b'1', '1564', '1564-Houdini 18.5'),
('01321201-89de-4c77-9cec-b2db302ab5ab', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '249', 'Character FX & Dynamics'),
('0152b73c-dcaa-4c48-add5-7fad863f4ee7', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '183', 'Google Apps'),
('0165defa-5133-44e3-b46a-b4adba1e95c4', '2025-11-30 13:31:21.000000', '2025-11-30 13:31:21.000000', b'1', b'0', '23', 'Wireless Technologies'),
('0196407d-e5f0-4337-8d4d-658a8903ab18', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '117', 'FJ-310 - Developing Applications for the Java EE Platform (Java EE5)'),
('01e0641d-4c0b-4158-b4f9-ebe12bfed2fb', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '817', 'Environmental Studies'),
('01f036de-e516-4492-955b-458939412145', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1328', '1328-CompTIA Network+ (N10-009)'),
('02b6492a-58a5-4122-b24a-c98ca3e54748', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '340', 'XML Web Services with Java (Java EE 7)'),
('036e60b1-7d11-49c4-9129-57c3407fa570', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1749', 'Portfolio Development'),
('03e15f35-ded1-42e7-ae9f-1e5ba486886e', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1300', '1300-Django Python Framework'),
('042a424d-0df1-48ad-8993-59b529f61983', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1257', '1257-Android Oreo 8.1'),
('04696ddf-cb5b-41db-8ae6-ea1ee90a5bd1', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '123', 'System Analysis and Design'),
('048256fc-d6ed-4aaa-bb21-56dadf9f9659', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1353', '1353-Oracle 23c PLSQL'),
('04bd04a6-748a-44e7-9fef-689c173cc1c4', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '811', 'Security & Legislation'),
('04dae7fa-6a55-4a85-a1bb-3df0aee11d84', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '298', '298-Email Marketing'),
('067ddd25-12dd-4261-88de-73add8d78897', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1716', 'Zbrush'),
('0808b8da-97b1-4916-b81d-8fbb0a065a6b', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '354', '354-Risk Management'),
('0827d219-5a56-4cf6-bd8e-1f714abb3679', '2025-11-30 13:31:21.000000', '2025-11-30 13:31:21.000000', b'1', b'0', '88', 'XML with JAVA'),
('0828a7e2-4c10-43b5-a114-11dab2e22139', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '383', '383-Apache (v2.4)'),
('085b4aa7-3475-4d88-a591-3b20ea636b7b', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1228', '1228-CompTIA Network+ (N10-006)'),
('0882cd89-186f-4430-8a65-5f8b3cc64b66', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '152', 'JSP & Servlets (Java EE5)'),
('09455850-2b3d-439f-b2b6-63e3f166fab5', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '373', '373-Windows Azure and Web Services (VS 2015)'),
('09af8d6e-34fc-4a1e-9543-970f15191996', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '701', 'Service,Safety & Security'),
('0a31bcef-34f1-4e31-b1a4-8943bdf520a7', '2025-11-30 13:31:21.000000', '2025-11-30 13:31:21.000000', b'1', b'0', '59', 'DESKTOP VB 6.0'),
('0a3dc4ab-5cc3-4de4-8e09-b9bcb7b4aff7', '2025-11-30 13:31:22.000000', '2025-12-01 09:26:45.000000', b'1', b'0', '259', '259-HTML AND CSS'),
('0a61d90e-8963-447b-9d8b-e95ee4623426', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1508', 'Web Technologies'),
('0a6cb6a1-e07d-4c37-8a90-540ee390bfac', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1357', '1357-WEKA'),
('0ae1734f-3eb0-4bc2-993b-506251cc9e3c', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '806', 'Air Fares and Ticketing'),
('0af42d9b-6a76-44f7-bcb7-84053e3dd79e', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1323', '1323-Azure Architect Technologies (AZ-303)'),
('0b657135-4f4d-4b03-ba22-0a000eab6096', '2025-11-30 13:31:21.000000', '2025-11-30 13:31:21.000000', b'1', b'0', '42', 'COM+'),
('0bc556ee-2737-43a6-b781-6d901644e646', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '323', 'Implementing an Advanced Server Infrastructure - Windows Server 2012'),
('0c06dc1c-b7b0-4154-bdd0-28f136a43de7', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1204', '1204-Corel Draw'),
('0c2ef610-1869-40bc-a9cd-cac520361cf1', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '365', '365-BCP/DR( Business Continunity & Disaster Management)'),
('0cdcbc62-05dc-4742-acc3-f0cb96e02f20', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '312', 'Windows Store Apps Development using HTML5'),
('0d004882-90f3-4155-a370-aa68d78ad098', '2025-11-30 13:31:21.000000', '2025-11-30 13:31:21.000000', b'1', b'0', '62', 'MS.Project'),
('0d2ee109-b8b5-425b-909e-22d00d3a47ce', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1260', '1260-User Experience (UX)'),
('0d4b88ec-6dbf-402f-91be-ab28c8d5bdb0', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1536', '1536-Autocad 2021'),
('0da0dd6e-b7ea-46f3-965a-aadb0d15959b', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '243', 'FCP'),
('0e331079-afdc-471a-a586-88a43493998a', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1329', '1329-Manage Modern Desktops with Windows'),
('0e6f778e-190a-43fd-b3de-b73ae6229060', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1527', '1527-Arnold Renderer 4.2 for MAYA Unlimited 2022'),
('0ec2b602-d1b9-46be-809d-a7f69eb2ec00', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1336', '1336-Certified Ethical Hacker CEH v12'),
('0ee9e0a8-0662-471e-93c5-bfa8fa203e26', '2025-11-30 13:31:21.000000', '2025-11-30 13:31:21.000000', b'1', b'0', '11', 'MS Srv 2k3 N/W Infra - Plan. & Maint.'),
('0f9c106f-b55c-4a15-95f2-30672f00b012', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '281', '281-Unity'),
('0f9f78e1-7b74-4e2f-9a74-a09f32d48e9f', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '256', 'Nuke'),
('0ff351fb-0a69-4fa6-97a2-dd048a2f52a7', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '140', 'Windows Forms with C# 2008'),
('104baf54-76f4-4faf-833b-23bc003acd12', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '279', '279-UI and UX for Responsive Web Design'),
('116046b3-c2ff-4945-b1aa-11c520ef6126', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1234', '1234-Microsoft Exchange Server 2016'),
('11818c6e-7e54-49d3-8532-1c1a11f07a9b', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1274', '1274-PHP (v7)'),
('11e7bc0b-1b5c-47cd-ba4d-87cfae7c82e1', '2025-11-30 13:31:23.000000', '2026-09-01 00:00:00.000000', b'1', b'1', '1374', '1374-MongoDB 8.x'),
('1265f283-6b1d-46a4-a75a-7a74614fe3a7', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1545', '1545-Bootstrap 5'),
('12f1b2fd-ae39-4cd6-832d-b38c7b79956c', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '309', 'MySQL'),
('12f93021-25dc-4913-9c38-ac79a5680581', '2025-11-30 13:31:21.000000', '2025-11-30 13:31:21.000000', b'1', b'0', '54', 'Desg MS Win2K Network Infrastructre'),
('137c10fb-cddc-4dc2-b2ad-ca8a21402673', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '289', 'Wordpress'),
('14c53bc6-7f00-47ac-8a9c-17bbbe4abcbd', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '343', '343-VB.NET 2012'),
('151e2b92-269c-4cf0-a761-023d2e8364b8', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '195', 'ASP.NET MVC4 Web Applications (VS 2012)'),
('152f0f8e-d082-488a-aa2d-b826e655b7ef', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1544', '1544-Adobe Dreamweaver CC'),
('154d20cc-7d1d-4650-a8d6-599aae202cd4', '2025-11-30 13:31:23.000000', '2026-09-01 00:00:00.000000', b'1', b'1', '1378', '1378-Data Lakes'),
('155196cc-b1ba-41c6-a86d-ed052a3198ab', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '336', 'iOS Application Development'),
('15593911-5be4-4f11-9789-7a2f02cf8f0a', '2025-11-30 13:31:21.000000', '2025-11-30 13:31:21.000000', b'1', b'0', '15', 'Data Structures'),
('156a958f-3657-4f4c-9216-be2573df6af0', '2025-11-30 13:31:21.000000', '2025-11-30 13:31:21.000000', b'1', b'0', '110', 'AJAX using ASP.NET'),
('1595c405-aaa1-452d-88b8-2471d27c7a2d', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '212', 'Maya'),
('15edf0a7-0c34-49f7-92cc-03963083eaf1', '2025-11-30 13:31:23.000000', '2024-09-01 00:00:00.000000', b'1', b'1', '1363', '1363-Office 2021'),
('16969aef-b98f-469f-bcfb-c97468549954', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '305', 'Agile SDLC'),
('171186bb-9efe-40d1-8ea9-37e3b5193fad', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1309', '1309-Servlets & JSP (Java EE8)'),
('183cfb47-4c95-4de4-bba3-1209ec11564f', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1224', '1224-Cyber Crime Investigation'),
('18d3f481-3881-4ec9-9973-03cf3088f69c', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '162', 'Windows Server 2008 Application Infrastructure Configuring'),
('19e10c75-1cd3-4d34-b692-57797267d334', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '322', 'Designing and Implementing a Server Infrastructure - Windows Server 2012'),
('1a29a26c-eee3-451d-9a63-f78ce9af63f1', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '812', 'Ancillary Services'),
('1a9962f0-108a-417b-954e-1aee31393575', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1244', 'Social Media Marketing'),
('1b017595-d9a5-4ae1-aa31-435988be374f', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '501', '501-CEFR-B2'),
('1b05972c-202a-4e92-bf88-88fd6e67400c', '2025-11-30 13:31:21.000000', '2025-11-30 13:31:21.000000', b'1', b'0', '26', 'RH033 - RED HAT LINUX 9'),
('1b3734f5-152e-4685-923b-87e6d91163f6', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '261', 'Flash Animation and Scripting'),
('1bb4f7a9-e50e-490e-8c9f-07bc4b2cb5b7', '2025-11-30 13:31:21.000000', '2025-11-30 13:31:21.000000', b'1', b'0', '44', 'RH133-RH Limux System Administration'),
('1c64ce6c-7ccc-4d04-bf95-f1cc31966e70', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '170', 'MS Office 2010'),
('1c996b1d-9726-4155-a1a8-f841de389293', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '267', 'Projection Mapping'),
('1cca9420-b9a8-4f44-891a-770a7cd89631', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '363', '363-Handheld devices Security'),
('1cd3bb58-0e56-4cfe-b81e-e926b99df104', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1258', '1258-Python (3.6)'),
('1cee904e-cbad-4337-af88-ff160666e01c', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '303', 'Administering Windows Server 2012'),
('1cefa30d-4aca-423c-b0a9-f4b2f0d3101f', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '126', 'PC Troubleshooting'),
('1d75685c-37cf-42d3-9280-f02e346d1fdf', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1342', '1342-Jakarta EE Platform 10 (Servlets-JSP-EJB)'),
('1db9fb36-3fcf-415c-9df2-5c2a561cfb76', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '814', 'Leisure Travel Management'),
('1ded0483-0e3b-400e-9ee1-1053077e2105', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '311', 'PHP'),
('1e078092-cfe3-43ae-959f-d4b0410d5251', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1708', 'Photoshop & ImageReady'),
('1ea63259-6e1b-44e5-a6f8-ea10fcad6a83', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1327', '1327-CompTIA A+ (1101 & 1102)'),
('1eb60c08-205d-4672-941b-7ae96d6ce52c', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1543', '1543-Unreal-Game'),
('1f3b4095-e655-4dc9-8135-07687311da7c', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '122', 'Structured Computer Organization'),
('1f62fa12-c562-4236-b517-95137e174eef', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '272', 'Mocha'),
('1fe990c3-5dfe-4bd5-adfc-8e4ed9d1b667', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '397', '397-AngularJs'),
('2042adf2-ad97-4e12-aee5-12811d5b426e', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '237', '237-Modeling and Texturing'),
('20be66b1-4ab9-4bbc-ac38-98f48b834fe8', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '380', '380-Advanced Java (Java SE 8)'),
('20c08e5c-430d-4ee1-89c9-c8dddc1c0ec6', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '277', '3D Printing Concepts'),
('2112a263-159a-4972-8dd4-b20116d8f16e', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1236', '1236-CCNP-Routing and Switching(300-101-115-135)'),
('21db8fa3-6163-4e36-8447-ec5a8bbccbce', '2025-11-30 13:31:21.000000', '2025-12-01 09:26:55.000000', b'1', b'0', '22', '352'),
('2246b0c4-4c66-4031-b191-54b788d69028', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1724', 'MatchMover / PFTrack'),
('22884076-016c-4244-ac2a-d9fe43ab19b4', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '367', '367-Advanced Ethical Hacking'),
('22b90611-eb2f-4393-9f6a-5226222d281d', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1715', 'Mudbox'),
('23be5a56-8b4c-47f4-86f6-0e2b0d46471f', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '805', 'Airlines Commercial Business'),
('2599af62-c566-427a-ad89-f06f2a8e37eb', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '147', 'XML with Java (Java SE 5)'),
('26a745e5-95b6-4708-a2dd-8ceda819e8d8', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1316', '1316-Material UI'),
('27830f5c-c4ad-4af5-b067-2b242c42846b', '2025-11-30 13:31:21.000000', '2025-11-30 13:31:21.000000', b'1', b'0', '95', 'Oracle 9i - Administrator DBA II'),
('27f8a332-54a5-432e-ac6c-4250ccd4da53', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1233', '1233-Identity with Windows Server 2016 (70-742)'),
('285f1eae-fc72-4676-8a6a-b0295036451b', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '313', 'Oracle Database 11g : Administration Workshop I'),
('28b0fbf0-3552-475e-ab42-5c8fa7dcb8ca', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '306', 'Oracle11g: SQL'),
('28eb70e1-7d9d-4f1c-b3a6-00ce290def98', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1292', '1292-Fundamentals of Java SE 15'),
('2a5f6928-4104-49ed-9740-19664a6c717e', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1522', '1522-Adobe Audition CC 2021'),
('2abdabf3-f571-43d5-9390-41463ffebb13', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '403', 'PHOTOSHOP'),
('2b5a6904-12c5-407f-8837-7a51a3348ca2', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1299', '1299-MySQL (v8.x)'),
('2c00da58-a558-4734-b841-1e7c07bd1ee3', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '278', '278-Digital Pre-Production'),
('2c1e6d45-329f-4584-b380-21ba7a218401', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1253', '1253-Programming in C# (VS 2017)'),
('2c825499-7f27-4ba0-a162-868aca503bc3', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '157', 'Windows Server 2008 Nwk Infra Configuring'),
('2ca34814-0287-4e3d-af8f-9d52f2a08a64', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '348', '348-MS Access 2013'),
('2ce81c06-06f7-47b4-87a1-485a11172c6f', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '338', 'JSF (2.0) & Struts (2.3)'),
('2d11f193-8c8c-4558-b616-266363778980', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '396', '396-Node.js'),
('2da7b0d3-d3cf-45a1-ace0-f6f5a5981ef5', '2025-11-30 13:31:21.000000', '2025-11-30 17:04:40.000000', b'1', b'0', '75', '75-Logic Building with C'),
('2db3a86e-7fdb-4239-a238-524c8a4514a3', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1725', 'CorelDraw / Illustrator / Indesign'),
('2df41133-4efe-4054-87da-a78aeee11e94', '2025-11-30 13:31:21.000000', '2025-11-30 13:31:21.000000', b'1', b'0', '78', 'SVVT'),
('2e8e4680-e660-4ae5-9536-4fe2209b716d', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1745', 'Advanced Web'),
('2eed2958-16a8-42c1-bc07-a30583b55818', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1225', '1225-Social Media Forensics'),
('2f4b8ef9-f12c-4a02-b078-659475c788af', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1212', '1212-Cyber Forensics'),
('2f5b72f2-3712-49f9-80ce-d89774157124', '2025-11-30 13:31:23.000000', '2026-09-01 00:00:00.000000', b'1', b'1', '1376', '1376-Certified Ethical Hacker CEH v13'),
('2fc7f4d4-a2d1-453c-a0c3-c2808e2c05a0', '2025-11-30 13:31:21.000000', '2025-11-30 13:31:21.000000', b'1', b'0', '27', 'XML Webservices with dotNet'),
('2fc9a954-0ab2-45a1-b515-c81a2ac1d69f', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1242', '1242-Email Marketing'),
('301000c3-babc-46da-8875-00ed19625995', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1296', '1296-MS Office 2019'),
('306ef211-a744-4dc5-8cc5-eab8089cb7c9', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1533', '1533-Lighting and Rendering (MAYA Unlimited 2022)'),
('30e2627d-d8ff-4b96-9ca1-be2b1e38636c', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '197', 'Internet Security'),
('31156880-5d2d-4971-8483-770f55d8c3c4', '2025-11-30 13:31:21.000000', '2025-11-30 13:31:21.000000', b'1', b'0', '41', 'OFFICE XP'),
('31385906-7723-4e19-8160-6c8ce73c74fb', '2025-11-30 13:31:21.000000', '2025-11-30 13:31:21.000000', b'1', b'0', '99', 'Oracle 9i - Forms Developer'),
('313a667b-4fd4-4c14-8478-52a737cbfd06', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '260', 'Java Script & Jquery'),
('316a155f-9b9d-4c2e-9b22-2ffb90134d1b', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '142', 'Windows Communication Foundation'),
('31847ab4-40c6-4575-8252-e3da6ab75b01', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '198', 'AJAX using Java'),
('31883475-2c63-4281-a1cb-6af9398e60a7', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '349', '349-Embedded Programming'),
('32285fc4-e361-4b67-94aa-29aec9c81f5b', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1331', '1331-Cisco Certified CyberOps Associate (200-201 CBROPS)'),
('32a01792-e4b8-422f-b493-c67a600db3ac', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '315', 'Discovery I :Networking for Home and Small Businesses'),
('32cab1d6-e05b-474c-ace6-1e75d4c258f1', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1720', 'Rigging & Animation for Games'),
('337fd674-a130-4071-9573-3bb875c3e04e', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '182', 'Google Search Engine Optimization'),
('33997fb5-8984-4b98-b6c8-72f32e5790fe', '2025-11-30 13:31:23.000000', '2025-03-01 00:00:00.000000', b'1', b'1', '1371', '1371-Gen AI for .NET Developers with Google AI'),
('33b3fcec-6376-4403-8dbc-35602ce8d157', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1756', 'Blender'),
('342a9558-fa7e-4981-a2f8-05f9e7672c84', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1506', 'Lead Nurturing'),
('344f2aaf-7389-4749-a64b-848119cb686c', '2025-11-30 13:31:21.000000', '2025-11-30 13:31:21.000000', b'1', b'0', '76', 'Distributed Application Development using dotNet'),
('3458882b-819c-4f6c-8e1c-10617c81cfcf', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '276', '276-Storyboarding'),
('34778cb1-d247-463c-a813-bbde9b935061', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '154', 'RH124-Red Hat Systems Administration - I'),
('34966ad0-13d9-407c-aba5-b987b759517b', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1505', 'Inbound Marketing'),
('34bae0c0-ec4e-4681-bad1-be37b1e4588a', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '163', 'Windows Server 2008, Enterprise Administrator'),
('35076ccf-fb02-40ec-908a-5d5723bb8ac2', '2025-11-30 13:31:21.000000', '2025-11-30 13:31:21.000000', b'1', b'0', '19', 'JSP'),
('3511c0c4-09b1-48db-b803-49cc9642f88f', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '240', '240-Advanced character Animation'),
('351e713e-ed48-429e-930e-4578a441411a', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '248', 'Advanced Modeling (Zbrush)'),
('353a11cd-e84e-4de7-9256-5a9633665e90', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '164', 'CCNA'),
('35953fa5-e2cd-464e-8bf7-8362091534b8', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '326', 'Security + (SY0-301)'),
('359da4a7-3b87-4535-9d72-6d0cb029116b', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1348', '1348-Metaverse'),
('35a4ff12-1fa0-4c23-a3bf-3f3ec0277555', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1297', '1297-Programming in C# (VS 2019)'),
('35eb0898-f213-4a06-95c9-684a7cd41a17', '2025-11-30 13:31:21.000000', '2025-11-30 13:31:21.000000', b'1', b'0', '34', 'FJ 310 - Developing applications for J2EE platform (J2EE 1.4)'),
('360292b2-ca91-4b74-9f7e-493be6d87054', '2025-11-30 13:31:23.000000', '2024-09-01 00:00:00.000000', b'1', b'1', '1364', '1364-Search Engine Optimization'),
('360a26a9-4cb3-447d-b13d-3aa2619b65fe', '2025-11-30 13:31:23.000000', '2025-06-01 00:00:00.000000', b'1', b'1', '1373', '1373-Graphics Designing'),
('36237eca-fd8d-4e4c-ac90-e10fadca23fb', '2025-11-30 13:31:23.000000', '2025-03-01 00:00:00.000000', b'1', b'1', '1369', '1369-JAVA-Docker and Kubernetes'),
('369586be-dcf2-4d07-a4f3-0a544f8d8a44', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '224', 'Motion Builder'),
('36a7143f-8d02-4be7-87d7-42ca2eae46dc', '2025-11-30 13:31:21.000000', '2025-11-30 13:31:21.000000', b'1', b'0', '112', 'Ruby Application using Rail'),
('36ec539b-b346-4820-8bc9-71b6159b1950', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '132', 'Developing Web Applications Using Microsoft Visual Studio 2008'),
('36fc063b-2b1b-411b-92c2-8dc814babcd9', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1319', '1319-Oracle 21c SQL'),
('37b58416-451c-40e6-a44b-24951cb4f400', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '208', 'Morphing & Warping'),
('37d5e2cd-44a7-4cd3-a54b-0aa2b0429568', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1219', '1219 Android Marshmallow'),
('38041b02-d150-4dd0-a8c1-1d493ee26110', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '394', '394-Web Analytics (Google Analytics)'),
('381c1982-25c3-4a13-8c14-b120475f303e', '2025-11-30 13:31:21.000000', '2025-11-30 13:31:21.000000', b'1', b'0', '37', 'SOFTWARE ENGINEERING'),
('38e535b4-b1ad-4203-8945-a5c38f244200', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '178', 'Dreamweaver (CS5)'),
('38e7fbc5-b312-470a-a35d-044180ec0da9', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1511', '1511-Bootstrap'),
('39081b3c-8a25-4177-9643-f747ee022a1a', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '344', '344-Office 2013'),
('3951be74-ac80-4bb3-abfb-ef26216df755', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1349', '1349-Salesforce'),
('398e7b2e-82d5-4df8-8b8c-49d8dbf56b6b', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '291', 'MySQL'),
('399ecfe7-bc06-4a9b-b6bb-69122f23b38a', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '352', '352-Information Security & Organizational Structure'),
('3a137f1b-9fe6-4d37-b865-89dc31380be1', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '350', 'Red Hat Linux Enterprise Edition 6.0'),
('3a95fa5b-b53d-4d2b-8114-7c10a1cd1357', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '250', '250-Rendering With V Ray - Max'),
('3aae1500-3c57-420d-8ab2-429544f7113a', '2025-11-30 13:31:21.000000', '2025-11-30 13:31:21.000000', b'1', b'0', '29', 'RH253 - Linux Networking and Security Administration'),
('3b5c05bc-a30a-48b4-947c-f7cf4b4ebcf5', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '235', 'Animation Design and Visualization'),
('3bba76e6-9b53-4c4b-87f6-04b84c6960cb', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '128', 'Programming Principles and Techniques'),
('3bd0c090-c997-42b1-af66-ee88c55464a6', '2025-11-30 13:31:21.000000', '2025-11-30 13:31:21.000000', b'1', b'0', '103', 'Windows Vista'),
('3bdce313-b1ff-451c-89f0-6bed50914095', '2025-11-30 13:31:21.000000', '2025-11-30 13:31:21.000000', b'1', b'0', '53', 'Desg MS Win2KDirectory Services Infras'),
('3d3a04cf-795e-4539-a385-d3f8211f6d42', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '388', '388-Python (3.4.2)'),
('3d702749-372c-471c-b4f3-5cce7c2b7a48', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '188', 'Google Android'),
('3d910488-4456-485e-9601-7000ae9b539a', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '294', 'Cinematography'),
('3e64dfd2-d08d-4c7c-8546-14f628de2ce2', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '210', '3D Game Engine'),
('3eb57efb-7060-48ee-9f0e-ba6e6076dae5', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1308', '1308-Windows Azure and Web Services (VS 2019)'),
('3f118d15-eda3-4f45-8817-a029f07e7e42', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '252', '252-Audio'),
('3fc5fcab-15fd-4b21-8702-703650dbb246', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '909', 'Event Management'),
('3fe99a97-0ae1-4fd0-802c-c47010713c1a', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1501', '1501-Social Media Marketing'),
('40165923-9c77-4db9-9711-48a3ecafcfb2', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1753', 'Sketchup'),
('40245b3c-8df2-4371-bf4f-94d5bf6c5169', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '241', 'Post Production for Animation'),
('403ae685-0153-4cd7-9e52-016dfccea82d', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1521', '1521-Adobe Indesign CC 2021 & Adobe Incopy CC 2021'),
('404a8054-f6f5-4adb-877d-25eb4603debf', '2025-11-30 13:31:21.000000', '2025-11-30 13:31:21.000000', b'1', b'0', '30', 'PROGRAMMING FUNDAMENTALS'),
('4065d8a4-3084-4c90-abd2-683b5e48e595', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1246', 'Content Marketing'),
('41c16fe6-544a-4841-9345-f14ccfd258cc', '2025-11-30 13:31:21.000000', '2025-11-30 13:31:21.000000', b'1', b'0', '109', 'Mobile Applications in Java (J2ME 1.0)'),
('425a5c0f-9cd3-4018-a769-939824912633', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '299', '299-Mobile Marketing'),
('42a246c9-cabb-4e42-bc1e-972183120fb4', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '359', '359-Security Models and Evaluation Criteria'),
('42c5920a-b0d1-4857-8171-0bb0edc670c9', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '206', 'Authorware'),
('42fe67a0-515a-4118-801c-7414b7e3b254', '2025-11-30 13:31:21.000000', '2025-12-01 09:26:55.000000', b'1', b'0', '24', '367'),
('4307b8fa-bdb2-42cc-8882-de8c3ac3c824', '2025-11-30 13:31:23.000000', '2025-03-01 00:00:00.000000', b'1', b'1', '1368', '1368-.NET Core-Docker and Kubernetes'),
('43363ef0-cc6c-417e-9c73-bed40e3ee500', '2025-11-30 13:31:21.000000', '2025-11-30 13:31:21.000000', b'1', b'0', '81', 'Networking Essentials'),
('435df6b3-927e-401a-ae1c-5f265d5c9290', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '124', 'E-Commerce Concepts'),
('43c31cc8-19db-4ef6-a353-b3e6bf3f460e', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1294', '1294-Android Development using Kotlin'),
('44d93e6d-636b-46d6-8cf7-a7c171360339', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '307', 'Oracle 11g: PL/SQL'),
('44fae20c-54fe-4e67-8877-19dd8f6ee09e', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1740', 'Houdini'),
('4555b304-abb4-46b2-9dfe-8fd3e704333d', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1539', '1539-Davinci Resolve'),
('45c73d14-6d1f-4036-b579-b344e92fcbba', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '342', 'XML with Java (Java SE 7)'),
('46049fab-2895-4e99-bfea-f3ce2d3b6771', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1216', '1216 SQL Server 2016'),
('46522576-7991-489c-8dbd-0bf6da3a0cac', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '375', '375-AJAX using ASP.NET (VS 2015)'),
('47e1f411-5d8c-4c00-83f2-3ab98dd63d0f', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '282', 'Basic Shapes and Sketching Techniques'),
('482685b9-e68e-4b79-bb1c-89e554d350c4', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1738', 'Smoke'),
('485cbd02-25d1-4993-9b2b-0f7978b69d0b', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1711', 'Audition'),
('493a98dc-db88-4de6-b3fe-631309e2f4bf', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1713', '3ds Max'),
('49a36801-1e94-49fa-80ed-97547dad91c3', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1356', '1356-Inferential Statistical Analysis'),
('49f0411e-1884-4d69-b266-2dafbcf9a5f7', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '265', 'Crowd Simulation'),
('4a3df39b-6e37-4bd8-bbe8-751a7078d872', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '160', 'Basics of Hardware and Networking'),
('4ab2e58d-cfcf-48bb-9d32-5e761900dcac', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '603', 'Etiquette'),
('4ad59b98-d168-4a75-885c-0948e72ec086', '2025-11-30 13:31:21.000000', '2025-11-30 13:31:21.000000', b'1', b'0', '98', 'Oralce 9i - Build Reports'),
('4aee7f29-a674-4128-a666-8dbd3bc0984e', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1230', '1230-Installing and Configuring Windows 10 (70-698)'),
('4b91a0c3-240d-43ba-b267-fb7bb4263fb0', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '242', 'Interface & Interaction Design'),
('4ba60b36-2cfa-4b07-b2bf-b6de68e85977', '2025-11-30 13:31:21.000000', '2025-11-30 13:31:21.000000', b'1', b'0', '105', 'C# 2005 and Winforms'),
('4be15a0b-e4e9-46f1-9500-070fb177c5d6', '2025-11-30 13:31:21.000000', '2025-11-30 13:31:21.000000', b'1', b'0', '69', 'Oracle 10g Forms'),
('4bfc68cb-289d-4060-97a2-098779b85a4e', '2025-11-30 13:31:21.000000', '2025-11-30 13:31:21.000000', b'1', b'0', '13', 'MS Srv 2k3 Dir Service Infra - Design'),
('4c1c3d00-3e53-407b-93c3-ea5a34b7640e', '2025-11-30 13:31:21.000000', '2025-11-30 13:31:21.000000', b'1', b'0', '84', 'Security Issues & Firewalls'),
('4c2dcbec-17b8-4f72-b473-51cb0f66110a', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '179', 'MS Project 2010'),
('4c7663a2-14ce-4e70-ba8d-bb94a5110386', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '377', '377-Oracle12c: SQL'),
('4c93d41e-5b31-4f25-a4f6-8163f4d6955c', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1222', '1222 Oracle12c: Administration'),
('4c9e5600-136c-4f79-b33a-09e5622d17bb', '2025-11-30 13:31:21.000000', '2025-11-30 13:31:21.000000', b'1', b'0', '58', 'DISTRIBUTED VB 6.0'),
('4de1cd8d-f50d-479d-b8b4-28ed0c365f9a', '2025-11-30 13:31:21.000000', '2025-11-30 13:31:21.000000', b'1', b'0', '33', 'Security in dotNet'),
('4df2ea48-6803-4ec1-bf13-1cafd0d1ae50', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '255', 'Flash Scripting'),
('4df320c5-fa2c-4cca-8323-35a990732440', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '369', '369-SQL Server 2014'),
('4e507a29-06a7-4d15-8bff-dad530bb9cad', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1247', 'Affiliate Marketing'),
('4f785685-c265-4e6f-8681-0f3686716a75', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1528', '1528-Augmented Reality for MAYA Unlimited 2022'),
('4fd7b493-0cb3-47c9-b4d8-e88e5862ea79', '2025-11-30 13:31:23.000000', '2025-03-01 00:00:00.000000', b'1', b'1', '1367', '1367-PHP (v8.x) with Laravel'),
('4fdb1527-223e-4d38-b169-d0601fddcb87', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1520', '1520-Adobe Lightroom CC 2021'),
('4ff8f13e-3501-404a-aba4-01e92bf12647', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1307', '1307-Flutter and Dart'),
('4ff999d2-33b7-4a76-bb9f-4f50ed0ba173', '2025-11-30 13:31:22.000000', '2024-06-01 00:00:00.000000', b'1', b'1', '346', '346-IT Ethics'),
('5005576d-c518-4363-a99b-948af3657087', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1345', '1345-ChatGPT'),
('50073d3e-d173-4a7d-a68b-9bbb18e264ae', '2025-11-30 13:31:21.000000', '2025-11-30 13:31:21.000000', b'1', b'0', '96', 'Oracle 9i - PL/SQL'),
('505459bc-7b79-4819-92bd-5c5023ca6024', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '271', '271-Animate CC'),
('507d6bc9-d264-472b-9fce-b4bc10c127c5', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '133', 'SQL Server 2008'),
('50ba02a4-5286-4775-9698-aa3854c08ca2', '2025-11-30 13:31:23.000000', '2026-09-01 00:00:00.000000', b'1', b'1', '1377', '1377-Machine Learning and Deep Learning'),
('513c178c-71bf-4cea-8299-5a3758293247', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1530', '1530-3Ds Max 2022'),
('5280a399-dc56-45ed-9756-d84931bf4c35', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '317', 'Discovery III : Introducing Routing and Switching in the Enterprise'),
('5282ac4d-d0cc-4b47-8dde-b468ab9a3f19', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '339', 'EJB 3.1 (Java EE7)'),
('5295ae67-bbb9-40f2-94e5-3e361dc503fb', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '372', '372-ASP.NET MVC Web Applications (VS 2015)'),
('52ecf195-5ca8-497c-816c-b161cb0f2568', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '804', 'Airport Handling'),
('5347eebd-0aa5-492a-953d-8871a5b93209', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '341', 'Servlets & JSP (Java EE7)'),
('535eb2bd-3186-4e61-a9cd-e8012dd0d1d8', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '207', '207-3 DS Max'),
('53957f6a-3bb4-4af5-a5f8-7fbbe3b1316b', '2025-11-30 13:31:21.000000', '2025-11-30 13:31:21.000000', b'1', b'0', '79', 'TCP/IP'),
('53a39c6d-fad4-4d8b-b575-903a13777229', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1266', 'Architecting Microsoft Azure Solutions'),
('547c7cf6-0163-4b77-b2dd-4b5c34954062', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1332', '1332-Microsoft Azure Architect Technologies AZ 800'),
('54e0cbcb-e794-425e-b1df-4a9c91fdec21', '2025-11-30 13:31:21.000000', '2025-11-30 13:31:21.000000', b'1', b'0', '114', 'Microsoft .NET Framework Application Development'),
('5511b4c6-ab84-4b90-9aba-6cc4ba452f23', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1730', 'Animation Specialization'),
('56bdca21-cf34-4c44-aa7a-619f174e5d5b', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '223', '223-Advanced Maya'),
('57285d7e-03f7-4349-be85-36d561dfefa4', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '225', 'Advanced Combustion'),
('588d7886-6dc8-4fb4-af1a-48e709c5c96b', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '151', 'EJB 3.0'),
('58cf8303-97b7-4bfe-8393-07b6dac906fb', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '902', 'Operations & Strategic Management'),
('59f798ef-9178-4f97-bea9-63856c39452a', '2025-11-30 13:31:21.000000', '2025-11-30 13:31:21.000000', b'1', b'0', '7', 'N+ Networking'),
('5b12fc56-2b62-4af2-8b7b-53a564c06a49', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '601', 'Grammar'),
('5b5a9bca-7010-47bf-a278-86e8c7bf0238', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '118', 'VS 2008'),
('5bd76253-41b4-453e-beb3-85e30f61a48f', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1741', 'Case Study'),
('5ca7c5f8-6386-4f90-aae7-8203c76ea56d', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1322', '1322-Implementing,Managing and Monitoring Azure Environment (AZ-104)'),
('5d0b35bd-7a20-4571-b066-c369b2cd476b', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1226', '1226-CompTIA Linux+'),
('5d2435b0-881f-4407-8d96-64aab0b9f37b', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1547', '1547-SQL Server 2019'),
('5d2b10d8-8f47-4428-9c39-28418a0a7390', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '139', 'C# 2008'),
('5d65ed22-75d4-4421-a7c1-04bee20ef3af', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1213', '1213-Cloud Administration'),
('5d6aceb5-3876-42f3-a70d-5ed6b0fb0b4e', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1311', '1311-XML Web Services (Java EE8)'),
('5e12f83d-4332-4a94-90bc-58edbfe65d6b', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1714', 'Maya'),
('5e7dc446-d6a9-45ad-ba5f-f56f32dbd19e', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1352', '1352-Oracle 23c SQL'),
('5ec67639-13e7-4109-85d0-8bddf1227606', '2025-11-30 13:31:21.000000', '2025-11-30 13:31:21.000000', b'1', b'0', '77', 'Dream Weaver MX'),
('5eca5ea5-5cd6-4e06-b61a-bdc5d5efa687', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1218', 'MySQL (v5.7)'),
('5ed6909b-2608-4866-872c-8cca60735580', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '173', 'Android Application Development'),
('5ee9931b-4ca6-4b48-a766-78a7a0d929ed', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1733', 'FumeFx'),
('5f31c0c0-e2fa-4192-aaec-38a8b8a9e96d', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '135', 'Maintaining a Microsoft SQL Server 2008 Database'),
('5f3e1070-9943-4b16-8b37-08dd6430c2b1', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1239', '1239-Software Testing-Selenium'),
('5f97b034-b2ff-4378-81df-df70c2618222', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '204', '204-Video'),
('5fcafbe6-28bd-4ad5-9eb5-d2c38ec56a17', '2025-11-30 13:31:22.000000', '2025-12-01 09:26:45.000000', b'1', b'0', '233', '233-Typography & Printing'),
('5fcee334-8caf-4a5e-b94a-7b388949c396', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1524', '1524-Adobe After Effects CC 2021'),
('601e8250-6bcb-4c4f-92da-42e10e918d73', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1261', '1261-User Interface (UI)'),
('60ce2903-5aa3-4b57-96ad-5dcea00e1aec', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1515', '1515-Cinema 4D R23'),
('61cfd4da-ded0-4710-9b2a-5d5036c91764', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '810', 'Airport Management'),
('61e7b2ce-f2b8-447d-a42b-c08f9283909d', '2025-11-30 13:31:23.000000', '2024-06-01 00:00:00.000000', b'1', b'1', '1565', '1565-Adobe Dimension'),
('6206b9ed-18f2-4420-820e-9fa0c02451fe', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '180', 'Fundamentals of Java SE 7'),
('624bdc73-39b4-478b-9fe1-2e100204a64d', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '138', 'Oracle 10g-Database Administration-II'),
('62c23c42-5fc9-4218-9312-04ae64481f45', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '901', 'Management Principles'),
('62eaf5c1-005b-4457-95fc-856640476559', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '385', '385-PHP (v5.6.2)'),
('631c62ab-c93b-4fba-b08b-47092d390d01', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '329', '329-Ethical Hacking'),
('64355eef-2362-4105-8d6b-bd9dd5d48b78', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1736', 'Game Portfolio Development'),
('6499146f-32ab-418d-a8ac-ad8b6a923d70', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '156', 'RH255-Red Hat Systems Administration - III'),
('64eb179d-873d-4f77-ae0e-bb9fe0bee8c8', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1743', 'Events & Competition'),
('6527ad3a-d128-4210-bdf1-4d40671ddfb9', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '149', 'XML Web Services with Java (Java EE 5)'),
('65465b2b-7373-43eb-acdc-f7446395a07c', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '332', 'MS Access 2010'),
('656ce943-f35f-4bd9-9473-c0b84e71ef07', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1315', '1315-Angular Applications with TypeScript'),
('6602e8c2-6b0a-4e07-829d-57b1e972b50a', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '116', 'SL 314 - Web component development with Servlets and JSP (Java EE 5)'),
('66ac2c43-a1de-46a4-bfbc-e23e8a393914', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '379', '379-Programming in Java SE 8'),
('67646b3c-22f5-41bb-9423-a6363e32e783', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1264', '1264-Tableau'),
('67a47ec1-7998-4b8f-8754-5246445604da', '2025-11-30 13:31:23.000000', '2024-06-01 00:00:00.000000', b'1', b'1', '1359', '1359-SQL Server 2022'),
('687c089f-295e-4ede-be2d-8f6eac66db23', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1721', 'Fusion'),
('68c82ad5-4db3-4be7-9297-4c9bc40d84ec', '2025-11-30 13:31:21.000000', '2025-11-30 13:31:21.000000', b'1', b'0', '86', 'HTML/ DHTML'),
('68d3ed5b-b94e-4734-a4f0-fce60e5d0b9f', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '247', 'GAME EXECUTION'),
('69367846-53f5-4d5c-ba2f-73a0f341173b', '2025-11-30 13:31:21.000000', '2025-11-30 13:31:21.000000', b'1', b'0', '71', 'RDBMS Concepts'),
('69630a8f-8b48-4472-b9b4-ba384a5da8c7', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1526', '1526-DaVinci Resolve 17 Fusion'),
('69dfefad-584d-4d07-98d9-f43971791988', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '325', 'Monitoring and Operating a Private Cloud with System Center 2012'),
('6a4693e0-726e-4cc8-b188-f752bea813a4', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '217', 'Combustion'),
('6af44967-8a2f-46db-86e4-3b79de83345a', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '295', '295-Marketing Principles'),
('6b0772ed-2201-4cf0-80a5-dff67834ee82', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1282', '1282-Implementing Cisco Connected Physical Security (VSM)'),
('6b9c8956-4d70-4f01-a2c6-617821824e31', '2025-11-30 13:31:21.000000', '2025-11-30 13:31:21.000000', b'1', b'0', '70', 'MS Web Programming with Visual Basic 2005'),
('6ba26201-6b7e-425a-a493-550748d24217', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1276', 'Internet of Things (IoT)'),
('6bf77d18-321a-43c0-ab02-213cf00e8b65', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '166', 'Developing Applications for the Java EE6 Platform (FJ-310-EE6)'),
('6d6d2628-cb7e-4241-ab90-d25254f5933c', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '364', '364-Cloud Security'),
('6de3ba4c-db31-40f4-86d7-8a55d523b4a9', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1333', '1333-Microsoft Azure Architect Design AZ 801'),
('6df3ed3c-5a32-4b6d-a2a1-bd9aabcdaa6c', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1718', 'Game Asset Development'),
('6e1e1360-c9ed-4db4-9cee-33893bb2dad3', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1227', '1227-CompTIA A+ (901 & 902)'),
('6e361c4f-cb25-42e3-8b7f-27573ae7232d', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1540', '1540-Unreal (For architecture)'),
('6e59dfc6-cd41-4609-a7c0-41dd5e8b53fd', '2025-11-30 13:31:21.000000', '2025-11-30 13:31:21.000000', b'1', b'0', '38', 'SL351-ADV BC development with EJB'),
('6e76bcbf-0490-40d0-b780-3d6af33f61d6', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '121', 'Computer Graphics using C'),
('6eaadacb-61eb-45b0-8e18-140ce92da395', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1341', '1341-Windows Azure Solutions (VS 2022)'),
('6ed3a664-47a6-441a-9fd5-b86c058cf7be', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1298', '1298-ASP.NET MVC Web Applications (VS 2019)'),
('6f2cbb42-8dd9-40cf-b32a-d3aee098c2cf', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1303', '1303-CompTIA A+ (1001 & 1002)'),
('6f2d6d43-e939-4fd3-8f01-386b16a5186f', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '381', '381-Spring Framework'),
('6f6f7035-9fb0-4e07-a4a4-10882cea38ff', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1275', 'Android Pie 9'),
('70d7b492-c31f-4cac-b339-44c7685d0260', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '705', 'Hospitality Management'),
('70e60dae-6a24-4a7b-87f1-bb23fe45bdc7', '2025-11-30 13:31:23.000000', '2025-11-30 17:04:40.000000', b'1', b'0', '1337', '1337- ReactJS'),
('712d199e-239b-44b7-8b33-ba5d72dc86b1', '2025-11-30 13:31:21.000000', '2025-11-30 13:31:21.000000', b'1', b'0', '85', 'Adv. Java'),
('71e4949f-3232-4a8b-8fe5-df62d25a390b', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1211', '1211-Red Hat Linux Enterprise Edition 7.0'),
('72291af6-5f44-4782-b39d-89c085743cbb', '2025-11-30 13:31:21.000000', '2025-11-30 13:31:21.000000', b'1', b'0', '51', 'Install, Config & Admini MSExchg2KServer'),
('72e6e647-b057-4701-be87-ddfdd7e58d34', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1754', 'Lumion'),
('7304e644-894e-4380-b6e1-e6ba296fba92', '2025-11-30 13:31:21.000000', '2025-11-30 13:31:21.000000', b'1', b'0', '63', 'CORE JAVA'),
('7398fcb6-21f8-40dd-b162-2fec9582ca08', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1518', '1518-CorelDRAW 2021'),
('745042b8-303e-4272-a490-03fd2c842b35', '2025-11-30 13:31:23.000000', '2024-06-01 00:00:00.000000', b'1', b'1', '1360', '1360-Unreal Game Development'),
('74bca36d-4c7a-48d6-9299-102064580dd7', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1251', '1251-Professional Issues in IT-NCC'),
('74ffab9b-6a19-4fed-aeb8-f5980582c021', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1321', '1321-Azure Fundamentals (AZ-900)'),
('752aecf9-3043-40e9-8385-579c79c4b16c', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '258', '258-Editing and Compositing'),
('75faf598-a8ff-40fa-8f8f-9950b66d4455', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1314', 'Red Hat V7 Security Administration'),
('76073cc3-47df-41f1-8609-cdfa3c06f873', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1255', '1255-Windows Forms Programming'),
('765f05c2-1177-41bd-90c4-cfb956833e92', '2025-11-30 13:31:22.000000', '2025-12-01 09:26:28.000000', b'1', b'0', '125', '125-Cloud Computing'),
('76c9f3dd-a154-4d76-802c-18223c464649', '2025-11-30 13:31:23.000000', '2024-06-01 00:00:00.000000', b'1', b'1', '1362', '1362-Red Hat Enterprise Linux 9'),
('76e68291-401b-46e9-83f4-fa9f081d886d', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1709', 'AfterEffects'),
('770cf831-c828-48ed-a449-5e6aa9af8cee', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1285', '1285-Hadoop'),
('778dd96e-0c93-4a47-8439-dbc00ebb883e', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1317', '1317-MERN Stack Development');
INSERT INTO `skills` (`id`, `creation_timestamp`, `update_timestamp`, `is_active`, `is_new`, `skill_code`, `skill_name`) VALUES
('7795c942-8267-43f7-abbc-621498ac83b7', '2025-11-30 13:31:21.000000', '2025-11-30 13:31:21.000000', b'1', b'0', '67', 'SPM'),
('7799b855-f631-4529-92e6-6740bf7df2da', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '190', 'Joomla'),
('77a0235c-8678-487c-8fcf-230037dc9cfe', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '189', 'Google Analytics'),
('786c871d-0ba3-4dff-b38e-77fd7a634a53', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '803', 'Passenger Handling'),
('78ac6562-ac27-48b9-b1fe-2e69f34c9712', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1710', 'Premiere'),
('78bc9900-b203-436f-9cbb-ad3791551091', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1519', '1519-Adobe Photoshop CC 2021'),
('79172d33-6544-40b2-8b60-c7aaea5d715f', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '374', '374-Amazon Web Services (AWS)-.NET'),
('79193336-f81c-49aa-9ac9-86b62a8a4751', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1351', '1351-Oracle 23c Administration'),
('79276b38-4771-471a-a54c-dd101e17fb10', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '398', '398-NoSQL'),
('79361c3d-4e58-4070-a240-15bedd269e23', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '356', '356-WAN Security & Wireless Technology'),
('79471818-8794-4b10-875f-8f276075bfea', '2025-11-30 13:31:23.000000', '2024-06-01 00:00:00.000000', b'1', b'1', '1561', '1561-Generative AI'),
('7a215c2c-9edc-469c-a8b2-d791b81c433d', '2025-11-30 13:31:21.000000', '2025-11-30 13:31:21.000000', b'1', b'0', '48', 'Win 2K Server'),
('7a2a3be9-4424-4e48-8735-900baac16205', '2025-11-30 13:31:23.000000', '2024-09-01 00:00:00.000000', b'1', b'1', '1365', '1365-Analytics'),
('7a356775-48f8-410b-9de8-b585e8dd9731', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1232', '1232-Networking with Windows Server 2016 (70-741)'),
('7a4d7c69-8321-4bd6-8747-49961c986da6', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '220', '220-Auto CAD'),
('7b0e272f-7ee9-4ffa-a3bd-aa57ac0ccd09', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1202', '1202-Computerised Accounting (Tally.ERP 9)'),
('7b24f570-4172-4dcf-99c4-bce64998134d', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1742', '2D Animation & Storyboarding'),
('7b9a5474-55b5-4d83-b8ec-1895620c9f37', '2025-11-30 13:31:23.000000', '2024-06-01 00:00:00.000000', b'1', b'1', '1563', '1563-3D Equalizer'),
('7be6762b-7255-4f0f-ace7-502ee20ae825', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '360', '360-Programing with Python & HTML5 Security'),
('7cb61142-4533-4da7-9910-2d3c159f7f42', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '268', 'Augmented Reality'),
('7cc7f5da-dd70-4cb7-995f-de9c7c3175ae', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1252', '1252-Analysis, Design, and Implementation-NCC'),
('7dee6e8e-635c-454b-b58b-b02d39542cb5', '2025-11-30 13:31:21.000000', '2025-11-30 13:31:21.000000', b'1', b'0', '61', 'VB.net and Winforms 2003'),
('7df1b648-149e-4902-af81-b13871ebab14', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1354', '1354-Designing Microsoft Azure Infrastructure Solutions (AZ-305)'),
('7ed4f9d2-f108-478b-89a8-432eb3a60689', '2025-11-30 13:31:21.000000', '2025-12-01 14:23:53.000000', b'1', b'0', '20', '1212'),
('7f09c119-a7c6-40c7-9cfd-3fb96d204214', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1201', '1201-MS Project 2013'),
('7f90d25a-faa8-4f98-94ac-24b7eee54e6b', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '269', 'Advertising Design Concept'),
('80046577-9122-46a9-9b1b-32cbf6ff2d02', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1301', '1301-Oracle19c Administration'),
('800d28eb-138a-4f9c-b104-06f0d011c29c', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1735', 'Autocad'),
('80da0153-eacf-4fd8-8823-82a240d23ee0', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1538', '1538-CorelDRAW 2020'),
('8115068b-abc2-4c48-85a9-b4d7d0c1155d', '2025-11-30 13:31:21.000000', '2025-11-30 13:31:21.000000', b'1', b'0', '28', 'SQL Server 2005'),
('815cc072-7572-4952-b045-29a8b17ce496', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1727', 'Flash'),
('8172d9ad-8692-4309-9650-5e156de10326', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '238', '238-Rigging and Animation'),
('826989e1-e20c-4869-8851-cdcc1501e285', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1535', '1535-FX and Dynamics (MAYA Unlimited 2022)'),
('830e2a23-0286-4c6b-a00a-73ef0c5de171', '2025-11-30 13:31:23.000000', '2025-11-30 17:04:40.000000', b'1', b'0', '1273', '1273-Version Control (Git)'),
('8353efad-ccb8-419a-b885-81883e8ff0a0', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1346', '1346-Shopify'),
('8483bde1-f7bc-4705-9930-2f45cdc9dda0', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1531', '1531-3Ds Max 2022 with V-Ray 5'),
('84e293c7-f381-4824-9c37-21c209afccfa', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '316', 'Discovery II :Working at a Small-to-Medium Business or ISP'),
('854ad2f4-424b-439a-bbfe-a68e7f9c1512', '2025-11-30 13:31:22.000000', '2025-12-01 09:26:45.000000', b'1', b'0', '202', '202-Photoshop & COG'),
('85c779b8-3bec-487c-b56b-bb4e3247afb9', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1512', '1512-Substance Designer and Painter'),
('864a143d-e0ec-4369-a8d1-e691a96accf8', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1249', 'Lead Nurturing'),
('86bda0db-4e67-4ae9-b227-e24caf1f2fca', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1304', '1304-CompTIA Network+ (N10-007)'),
('86c91207-ed9f-4b82-b4f3-0b66f6daffd1', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '292', 'Storytelling'),
('870e2f7f-ea7f-453b-8c9d-ba0c761f8c64', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '275', '275-Search Engine Optimization'),
('8820b9eb-602e-4be2-8b7e-6b3302b64ccf', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '221', '221-Indesign'),
('88658ecb-8bd7-4358-9528-ca1b649abb10', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '191', 'SQL Server 2012'),
('8884265f-00b2-4796-af1d-8f0fe7c8b8e3', '2025-11-30 13:31:21.000000', '2025-11-30 13:31:21.000000', b'1', b'0', '50', 'Imple&Admini a WinDS Infras'),
('88c678b9-7f15-4a05-ae1e-eedb1938666f', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1240', '1240-Marketing Principles'),
('88c6a8ec-16bd-47ba-9671-994e1d966765', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1344', '1344-MS Project 2021'),
('88eff82e-ff04-423c-b29c-4f175922f742', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '239', '239-Lighting and Rendering'),
('890627d2-7021-41ca-9fd4-cf8a0a19cdcd', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1752', 'Digital Marketing'),
('89342991-13b3-47cd-aa5b-14cf74d71934', '2025-11-30 13:31:21.000000', '2025-11-30 13:31:21.000000', b'1', b'0', '104', '.Net Framework 3.5'),
('894f3b78-29ea-4d38-97bb-f53dc1a35dd0', '2025-11-30 13:31:23.000000', '2024-06-01 00:00:00.000000', b'1', b'1', '1358', '1358-Office 365'),
('89870be2-6419-4b5d-ab7d-8e303692b643', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1340', '1340-ASP.NET CORE MVC (VS 2022)'),
('89df6456-3a0e-464c-8378-5d35e18d26e4', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1717', 'Unity'),
('8a1074bb-3b35-493d-ba03-f8bf6b135209', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1534', '1534-Rigging and Animation (MAYA Unlimited 2022)'),
('8a3d2ec0-8421-4cb0-9cee-60a68255a530', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '334', 'Objective C'),
('8a99ec86-c30b-4aef-85c9-7e9a3ddca08d', '2025-11-30 13:31:21.000000', '2025-11-30 13:31:21.000000', b'1', b'0', '82', 'MS Access 2007'),
('8be33092-c963-444a-9b11-4c81e3985fad', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '286', 'Advanced Digital Compositing'),
('8c5a7a5f-bfcc-4847-b9ca-5db1e7d792a6', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1525', '1525-Nuke 13'),
('8caf761c-48b8-47b3-a4eb-52d5d4a6c330', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '284', 'Keyframing and In-Betweening'),
('8d0f58d4-6a93-4a04-ab9b-a1cf47777227', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1350', '1350-Microsoft Dynamics'),
('8d87bb35-f056-4dc7-b405-89bcbaacfd2b', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '602', 'Phonetics & ESL'),
('8dd13c27-8f55-4b02-827d-e66d2afea328', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '194', 'Windows Store Apps using C# (VS 2012)'),
('8e9e9e85-37f5-4966-bc42-3eea7c56b15c', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1325', '1325-Data Visualization with Power BI'),
('8f82151c-cd45-4c10-9c1f-cb40b1ab5902', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '137', 'Oracle Database 10g Administration - I'),
('8ff839fb-e9bf-47b1-94da-e1d346bcff2e', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1248', 'Inbound Marketing'),
('90913189-02c3-4099-9955-2639381293c0', '2025-11-30 13:31:21.000000', '2025-11-30 13:31:21.000000', b'1', b'0', '46', 'WebSite Desg&Pub with FP2000'),
('92540783-e8cb-437a-9814-6540085bbe5f', '2025-11-30 13:31:21.000000', '2025-11-30 13:31:21.000000', b'1', b'0', '87', 'Computerised Accounting'),
('9293f1e0-d4e8-4379-9c40-b4a0f79d33be', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1712', 'Combustion'),
('93a9e0e3-aee7-4eea-955f-188640c229dc', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '391', '391-Online Advertising and Management (Google Adwords)'),
('93beb8b4-a49d-4482-9ebf-c61c51a2d647', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '211', 'Flash'),
('94353565-9014-4690-bd14-84d4d245641c', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '245', 'PRE-PRODUCTION FOR GAMES'),
('94445d4e-22f0-4676-a1a7-095a5ae25d70', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '287', 'Cinema 4D'),
('950ce80d-afb2-41ac-a1d8-b2c8aa4d2b2b', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '321', 'Routing Tech (CCNA) (200-120)'),
('95781dfd-6dae-4a13-b8d8-6a13ae24d9a7', '2025-11-30 13:31:21.000000', '2025-12-01 09:26:55.000000', b'1', b'0', '40', '329'),
('957efc77-be57-4c61-b680-a3faea71a54c', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '266', 'Pixar RenderMan'),
('95d735f0-8cce-4d35-bc13-a566046ae6f5', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1542', '1542-Filmmaking and Pre-Production'),
('96b15110-8b47-4c08-b814-f5e369e8039f', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1509', '1509-Post Processing (Photoshop and Lightroom)'),
('96f153a4-3eaa-48a3-946a-cdca5b5c5a56', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '218', 'Avid Xpress'),
('97352529-5935-42f6-9632-d1768c230514', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1288', 'Technical Report Writing'),
('973c18ce-198d-4184-bbd4-016d7fa4b3dd', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1262', 'R Programming'),
('97914bb7-558e-4db3-b998-dec4a3d7d454', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1729', 'Lighting Specialization'),
('9791c73f-8d26-4136-95fb-39cfd723766f', '2025-11-30 13:31:21.000000', '2025-11-30 13:31:21.000000', b'1', b'0', '49', 'Imple&Admini a Win2K Network Infras'),
('991682a4-b5ed-492f-a91c-3193bfa90d96', '2025-11-30 13:31:21.000000', '2025-11-30 13:31:21.000000', b'1', b'0', '108', 'AJAX using Java'),
('99795f51-4020-46d5-8546-16fc9827e412', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1737', 'Photography & Cinematography'),
('99cb0eae-baac-4861-ac54-afa5c849e7e8', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '390', '390-Social Media'),
('9a86fb3a-daa2-4bfe-9865-a9f1cc31c706', '2025-11-30 13:31:21.000000', '2025-11-30 13:31:21.000000', b'1', b'0', '74', 'OOPs with C++'),
('9aa44e28-14eb-4bda-a0a7-cb0710916e45', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1235', '1235-CCNA Security (210-260)'),
('9ab9b7b4-258f-402b-8743-8c67921dd4c1', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '246', 'GAME PRODUCTION'),
('9ae625d2-8424-436e-8dea-14eb9cac7bc8', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '262', '262-Non - examinable module'),
('9af3a2d2-db08-4fb2-84ce-59eb68f6a7a1', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1532', '1532-Modeling and Texturing (MAYA Unlimited 2022)'),
('9bb78d3c-a2ae-49cb-87c8-c1be3027eb23', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1237', '1237-MS Office 2016'),
('9bcad5d8-e05a-421a-bcc5-e62fc638062a', '2025-11-30 13:31:21.000000', '2025-11-30 13:31:21.000000', b'1', b'0', '45', 'OFFICE 2000'),
('9beb3d02-c790-4ca8-bcf6-7cb12810ff35', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '193', 'Advanced Java (Java SE 7)'),
('9c15ca19-fbb6-484f-b735-c1babde4a998', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '283', 'Character Design and Development'),
('9cab5d3c-bf38-4cf6-8ba8-8d89a2256efb', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1744', 'Non Examinable'),
('9cdb99b1-86ed-410d-82f6-e6ce2802a77e', '2025-11-30 13:31:23.000000', '2024-06-01 00:00:00.000000', b'1', b'1', '1361', '1361-Generative AI-Prompt Engineering'),
('9cfda7b1-58fe-427a-a0b9-83be49c1c003', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '387', '387-Drupal'),
('9d12e09a-e985-4cd7-986a-20b7f3bcbc62', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '310', 'Perl'),
('9d8f35f2-19df-472c-a041-06a0a45ccb1b', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1751', 'Cinema 4D'),
('9e2fd75b-38ab-4c39-916b-fb4110a698e7', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '813', 'IT'),
('9e365c9a-90f7-475a-9768-1b64a7f50c5c', '2025-11-30 13:31:21.000000', '2025-11-30 14:46:53.000000', b'1', b'0', '9', 'Imp & Admin MS Win Svr 2k3'),
('9e9879c6-d601-4ddf-9925-a03737e985d8', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '382', '382-Android Lollipop'),
('9f77e062-f34f-4bcc-8640-e12835662166', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '362', '362-Security Architecture & Hacking'),
('9fc1a273-fb97-417e-bf30-f547026e6429', '2025-11-30 13:31:21.000000', '2025-11-30 13:31:21.000000', b'1', b'0', '52', 'Desg&DeployamsgInfraswithMSExchg2KSer'),
('9ff02851-950c-47de-a8e5-6c48f34ccfd3', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '145', 'Microsoft Web Expression'),
('a0357052-6ef1-4e2d-b28d-b2b5993fe8c6', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '209', '209-After Effects'),
('a04bf011-573b-4853-8f6b-903d9350cea4', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1313', 'Red Hat V7 System Administration'),
('a05fe587-0473-4b24-86f0-8060df685c29', '2025-11-30 13:31:21.000000', '2025-11-30 13:31:21.000000', b'1', b'0', '113', 'Server+'),
('a0f7cd2e-8736-4068-b321-0e85ad798a6c', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1283', '1283-Installing and Configuring VMware vSphere'),
('a12a93c1-ac7a-4fe9-be61-fc1d51ef0d2b', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '376', '376-Mobile Applications using Windows Phone (VS 2015)'),
('a12bd91f-945a-466d-9be2-df4b6d75a3ad', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '704', 'Customer Service'),
('a1774ce0-2814-419d-ad67-1415f79dd351', '2025-11-30 13:31:21.000000', '2025-11-30 17:04:40.000000', b'1', b'0', '17', '17-XML'),
('a239009c-5e03-4a3d-bb61-f79042008804', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1302', '1302-Oracle19c SQL'),
('a2391d0a-8d9a-4a64-a7c3-7ec6b425bd1e', '2025-11-30 13:31:21.000000', '2025-11-30 13:31:21.000000', b'1', b'0', '66', 'Oracle10g SQL and PLSQL'),
('a3117a71-de62-4c82-bb8d-773fcb52b3d6', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '119', 'Office 2003'),
('a3b2d60c-494a-4752-a5d1-47bef726a4f0', '2025-11-30 13:31:21.000000', '2025-11-30 13:31:21.000000', b'1', b'0', '101', 'Security+'),
('a4411ad6-40ab-4742-86a8-8513ec078aea', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1548', '1548-C# 2019'),
('a479390c-ed3e-4cfc-8908-0ff5465f6a70', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '318', 'Discovery IV : Designing and Supporting Computer Networks'),
('a4c89fed-9a21-4f81-b699-3fe16973d0ad', '2025-11-30 13:31:21.000000', '2025-11-30 13:31:21.000000', b'1', b'0', '18', 'CSharp 2005'),
('a4fb6744-18a6-4861-928e-2b33aff6b691', '2025-11-30 13:31:21.000000', '2025-11-30 13:31:21.000000', b'1', b'0', '106', 'Windows XP Professional'),
('a50d573a-11b4-4065-a4ae-99a82488536c', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '185', 'Google Display Advertising'),
('a5564967-03e4-464c-ba8f-ea9427824065', '2025-11-30 13:31:21.000000', '2025-11-30 13:31:21.000000', b'1', b'0', '80', 'Internet and Intranet Strategies'),
('a5986847-5071-4488-b5e3-d6f3a9d96e4c', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1734', 'Revit'),
('a59d3891-cdaf-4f12-b4fe-98dd8d9c2c7d', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '131', 'Advanced Data Access in .NET - VS 2008'),
('a5c69e7b-a6da-4a54-b4c2-c1107fcd1da0', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '386', '386-Shell Scripting'),
('a63ea219-4690-4685-9003-899d2c1d34f8', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '214', 'Java Script'),
('a6bf9b13-d887-41d2-b4c5-60b04f00920a', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1254', '1254-ASP.NET MVC Web Applications (VS 2017)'),
('a6e84009-8a68-4c78-9652-034f0f4b6b7f', '2025-11-30 13:31:21.000000', '2025-11-30 13:31:21.000000', b'1', b'0', '60', 'ASP.net + Web forms 2003'),
('a7321b09-a384-4011-b238-8d9f8ffa643f', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '328', 'CCNA Security'),
('a757739f-0110-4944-a051-659b1da52c27', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '906', 'Marketing'),
('a77d364e-c344-40f7-bcae-2dc5b7944ecd', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '399', '399-MongoDB & Cassandra'),
('a8a560fe-4f24-4983-b0fd-818fe6040772', '2025-11-30 13:31:21.000000', '2025-12-01 09:26:55.000000', b'1', b'0', '32', '321'),
('a99d86e8-e070-4f94-8588-929c29deeb5a', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1546', '1546-Logic Building with C'),
('aa3c9674-2642-469d-a531-102dd291e086', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '253', 'Illustrator'),
('aabede0a-14e2-4731-90c1-d0e88e44280a', '2025-11-30 13:31:21.000000', '2025-11-30 13:31:21.000000', b'1', b'0', '12', 'MS Srv 2k3 Dir Service Infra - P, I & M'),
('aaf7b8c0-579e-477d-83bb-f09413b9f37a', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '384', '384-MySQL (v5.6)'),
('abb54375-8e9d-46a5-a1f9-38003cfb8d84', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1507', 'Legal Ecommerce'),
('ac6584b6-b077-40d7-9216-bb59436e89d2', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '254', 'CorelDraw'),
('ac686c01-849e-4193-b6d9-f4af0ac8acab', '2025-11-30 13:31:23.000000', '2024-06-01 00:00:00.000000', b'1', b'1', '1559', '1559-Pre Production for Animation'),
('ac7c6ee4-a0d1-48b5-bad8-4d2013ddf811', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '324', 'Configuring and Deploying a Private Cloud with System Center 2012'),
('ac826e66-577c-4213-8dbb-58e33725e191', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '155', 'RH135-Red Hat Systems Administration - II'),
('acad8721-8828-497a-8534-41f810cdb0f2', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1726', 'HTML / DreamWeaver / JavaScript'),
('ad02295c-2b11-44f9-bd87-1660158fc6f7', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '378', '378-Fundamentals of Java SE 8'),
('ad1b61cc-c799-456a-8b14-b7d63b0387d1', '2025-11-30 13:31:22.000000', '2025-12-01 09:26:45.000000', b'1', b'0', '203', '203-MediaPublishing-PageMaker,QuarkExp & CDA'),
('ad552fc5-2064-44a2-8802-54d4ac634422', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '127', 'Windows 7'),
('ad6fd15e-26c7-4fcc-8119-77bec428eead', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1289', 'Management'),
('ad72c23a-57e3-4ced-9cc0-b76f37c6b173', '2025-11-30 13:31:21.000000', '2025-11-30 14:46:38.000000', b'1', b'0', '6', 'A+ Operating System and Hardware'),
('ad951712-8928-4db4-824f-bd7b2286458d', '2025-11-30 13:31:21.000000', '2025-11-30 13:31:21.000000', b'1', b'0', '21', 'Servlet Programming'),
('ae4ce376-cf45-49f9-bdde-3320c0a0aee9', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '345', '345-MS Exchange Server 2013'),
('ae67c667-d18a-4820-a0f8-b6ffbb1178f1', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '176', 'Open Source Design Patterns'),
('ae7f2b6e-28ac-47e8-a35f-7caebb46af51', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1330', '1330-Red Hat V8 System Administration'),
('ae811142-fece-41a7-8e7e-2a00fb91298d', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1287', 'Occupational Health, Safety & Environment'),
('aec21287-21bb-4542-9fe8-e1cce8afc1be', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '264', 'Web Essentials'),
('aef404bd-d93b-4b5b-86d5-000fbcc15498', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '807', 'Load Planning'),
('af27f5e4-ffec-475e-9e24-805f6e951518', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1728', 'Modeling Specialization'),
('af4b3363-6d4b-4b7f-925f-670c9c6c489e', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1259', '1259-MS Project 2016'),
('af4b79ba-d073-42c3-967f-8353cca0364f', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '200', 'Mobile Applications using Windows Phone'),
('afdf68a3-cd93-4997-9dfa-e03f6e60516c', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1265', 'Implementing Microsoft Azure Infrastructure Solutions'),
('afffa396-5ef8-4ac3-82ac-17d45ad4d02f', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '308', 'Apache'),
('b049cae6-0f82-4d4e-bccd-82c814d73f20', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '165', 'MS Exchange Server 2007'),
('b11c9f7b-e120-418d-8911-2107b2bd4fd7', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '355', '355-Mobile Computing & Cloud Computing'),
('b134a1f9-194f-4d7b-957e-2c8b18b7d87d', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '808', 'Dangerous Goods'),
('b1c10a04-39eb-4d4f-bc06-d353f37f180c', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1305', '1305-CCNA-Routing & Switching (200-301)'),
('b244d58e-878f-45c2-963e-7900a74f52d8', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '273', '273-Photography Concepts and Lightroom'),
('b443fb7f-e50d-4d21-b8e7-60b4981aa0cf', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '169', '169-Oracle 10g:Build Reports'),
('b6956ec0-72c4-4675-89b7-dc9f0081aea9', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '400', '400-Amazon Web Services (AWS)-.Java'),
('b6c1c3e3-2d19-49e1-822e-fb72c352b4a3', '2025-11-30 13:31:23.000000', '2024-06-01 00:00:00.000000', b'1', b'1', '1560', '1560-Adobe Sampler/Reality Scan'),
('b848fd66-80d4-4970-b6e2-b54d0eb9642f', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1231', '1231-Installation, Storage, and Compute with Windows Server 2016 (70-740)'),
('b88e8d79-ac73-4a20-b657-1afd3f8799ca', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1706', 'Pre-Production'),
('b8b8fa30-0a84-46e2-94f7-9e271dcf5ee6', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '320', 'Network+ (005)'),
('b9bccab3-1539-455c-be66-45fc057d5cae', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '290', 'PHP'),
('b9ec83f2-5475-490c-8db5-0f2ea861e1e7', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1220', '1220-Swift Programming'),
('ba5623ff-24bf-4a22-a583-0e1dcacefad4', '2025-11-30 13:31:23.000000', '2025-03-01 00:00:00.000000', b'1', b'1', '1372', '1372-Docker and Kubernetes'),
('bb20db4d-7e41-45f6-b6d1-696b461a2665', '2025-11-30 13:31:21.000000', '2025-11-30 13:31:21.000000', b'1', b'0', '10', 'MS Srv 2k3 N/W Infra - IMM'),
('bba10e34-846b-4234-9db0-ca8dca52f057', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '395', '395-Reporting & Analytics (Google Reporting)'),
('bbb09c69-61d6-4817-ab70-8a6cced54c72', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1334', '1334-CCNP Enterprise (Core Exam 350 401 ENCOR)'),
('bc128604-1451-4f72-a4e0-de261a0e599a', '2025-11-30 13:31:21.000000', '2025-11-30 13:31:21.000000', b'1', b'0', '107', 'SL275 - SE 6 - Java Programming Language'),
('bc9a69b3-c839-434f-9d2b-86340e3497cc', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1719', 'Game Theory / Game Design / Texturing for Games & Game Review'),
('bcb9977e-bc57-4b2f-93ab-c4d429881666', '2025-11-30 13:31:21.000000', '2025-11-30 13:31:21.000000', b'1', b'0', '64', 'Access 2000'),
('bd0e4df2-0fd2-487e-a4e2-a9455b33c461', '2025-11-30 13:31:21.000000', '2025-11-30 13:31:21.000000', b'1', b'0', '31', 'Microsoft CPLS Courses Program, Sudan STCs (Linux, MCSE, Oracle 10g DBA and CCNA)'),
('bd1bbe96-b26d-455d-9d95-b6f61cfbba17', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '327', 'Microsoft Forefront Unified Access Gateway 2010'),
('bd4697f8-7075-493e-99a0-69e65773c21d', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1245', 'Social Marketing Optimization'),
('bd7be9ad-712c-4524-97a6-88851138ef5a', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '150', 'Oracle 10g-SQL'),
('bd94c55f-11c3-4f5c-bc53-b5d30d96dd57', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1243', '1243-Mobile Marketing'),
('bda23612-576d-473d-acf5-1f1b72b16b61', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '270', 'Photography'),
('bda45b37-e21f-407a-bfc0-2feafc430eff', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '146', 'JSF (1.2) and Struts (2.0)'),
('bda482d7-bdc7-45fc-8e69-018744c2e87d', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '604', 'Presentation & Communication Skills'),
('be75ad61-0591-4fc6-8bd0-b915251ce11e', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '815', 'Travel Related Studies'),
('bf857eb7-9014-42c4-ba2b-6a361824385f', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '402', 'DFM/STOPMOTION'),
('bffdbce1-2ce1-408d-b425-56cf0cfb7b5a', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '293', 'Acting for Film'),
('c004c6a4-9dae-4d5a-9e65-2828f9223e67', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '300', '300-Web Analytics'),
('c03c5be2-d093-4317-b936-94437f2214e3', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1723', 'Final Cut Pro'),
('c03e79f2-65ef-401e-8bd1-f8d66f1699fa', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1241', '1241-Search Marketing'),
('c06a370b-a8d6-4cca-aa0b-7fd3d160fa0f', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '285', 'Concepts of Clean Up'),
('c0826bc7-12a5-483c-87f1-f2dc07b991be', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1732', 'Nuke & Mocha'),
('c0df00d5-a75c-48c3-b5ed-8642fb825686', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1502', '1502-Social Marketing Optimization'),
('c1242eff-a4bc-4445-a6b1-e4e891da4209', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '802', 'Cargo & Transportation'),
('c181a954-0b6e-43fe-a6e5-4949f62e9c66', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '358', '358-Cryptography'),
('c2110eab-ea54-4cdd-8b52-d850ca3083b6', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '304', 'Configuring Advanced Windows Server 2012 Services'),
('c31802a3-e5ec-4187-861c-875c14902ed6', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '230', '230-2D-ANATOMY STUDY/2D ANIMATION'),
('c342f60f-9fda-4025-bf93-5775a0916130', '2025-11-30 13:31:21.000000', '2025-11-30 13:31:21.000000', b'1', b'0', '25', 'SQL SERVER 2K'),
('c36ec9d4-edca-461f-a172-bcbb5ead8a74', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1529', '1529-Adobe Animate CC 2021'),
('c39e923d-22cb-4c4e-984a-ff982511fd50', '2025-11-30 13:31:21.000000', '2025-11-30 13:31:21.000000', b'1', b'0', '89', 'JAVA MESSAGE SERVICE'),
('c3b317dc-041a-4b79-a44b-591b2a16f781', '2025-11-30 13:31:21.000000', '2025-11-30 13:31:21.000000', b'1', b'0', '100', 'Digital Electronics'),
('c3ed2059-4192-46b7-aab8-890e99bd41a7', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '319', 'Comp TIA A+ (801 & 802)'),
('c42443a2-27a3-4d3d-94ff-43bffe3f0e53', '2025-11-30 13:31:21.000000', '2025-11-30 13:31:21.000000', b'1', b'0', '97', 'Oracle 9i - Performance Tuning'),
('c45f2a0f-b45d-41a3-b047-ed3e73f8b9b5', '2025-11-30 13:31:21.000000', '2025-11-30 13:31:21.000000', b'1', b'0', '83', 'IIS'),
('c49db3e2-61bc-462f-9dfa-d41de819d56f', '2025-11-30 13:31:21.000000', '2025-11-30 13:31:21.000000', b'1', b'0', '35', 'SL 314 - Web component development with Servlets and JSP (J2EE 1.4)'),
('c4a6b250-a3e6-4f66-969d-7fcb497c7854', '2025-11-30 13:31:21.000000', '2025-11-30 13:31:21.000000', b'1', b'0', '68', 'SQA'),
('c59592c9-2b32-4f18-b178-590a24b49fdf', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '161', 'Networking wtih Routers'),
('c59b90a9-7833-407c-bf5e-035c8d230e0b', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '503', '503-CEFR-A2'),
('c5c44c67-032b-4580-a33e-219c6951f1be', '2025-11-30 13:31:21.000000', '2025-11-30 13:31:21.000000', b'1', b'0', '65', 'Client side Scripting with JavaScript'),
('c5e81f61-3fb0-43a1-a672-549b14ec1a09', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '801', 'General Subjects'),
('c629fca3-62bf-44f5-b230-29ea2963de97', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '174', '.NET Design Patterns'),
('c755d43e-ae1b-4b13-9937-5f7b0915a89a', '2025-11-30 13:31:21.000000', '2025-11-30 13:31:21.000000', b'1', b'0', '56', 'MS Windows Programming using Visual Basic 2005'),
('c7df9533-ad65-48d7-b1c1-72c40e99d09e', '2025-11-30 13:31:21.000000', '2025-11-30 13:31:21.000000', b'1', b'0', '8', 'Office 2007'),
('c82ab425-300b-433e-9cd5-7a51750373a1', '2025-11-30 13:31:21.000000', '2025-11-30 13:31:21.000000', b'1', b'0', '39', 'Java Security'),
('c928e37a-e1cb-4e5d-8bb8-4d9f20d01175', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '392', '392-Display Advertising (Google Display)'),
('c9a32b0b-8c35-42d9-b7d6-31b757fd5714', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '141', 'ASP.Net 2008'),
('ca5ff38a-9a86-4b08-bc4a-97c40f4069ea', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1541', '1541-ZBrush 2021.6.4'),
('cac4092d-0600-4140-affb-4c6b6ce9da5c', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1510', '1510-UI'),
('cb41ef50-b00c-4ca4-9d89-04d618be153b', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1291', '1291-SQL Server 2019'),
('cb9eb053-b64b-4bf5-92e3-e3a74990246e', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1516', '1516-Concept of Graphics, Illustration, Print and Advertising'),
('cbfb0fd6-1c35-4f12-b43a-2abc844a21f9', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1722', 'Realflow'),
('cc492ab6-63b9-4dbf-874f-06c7c7079050', '2025-11-30 13:31:23.000000', '2024-06-01 00:00:00.000000', b'1', b'1', '1562', '1562-Silhouette 2021'),
('ccbc3f6a-8478-4e80-9deb-3a81639cf2cd', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1739', 'Vue'),
('ccf38491-6ae3-422b-a281-2cc9418ed563', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '809', 'Airport Operations'),
('ccf3b156-11c1-45c7-9933-a814e43b9c05', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1256', '1256-Windows Azure and Web Services (VS 2017)'),
('ce3a093f-18ca-4175-8bc6-39a80438142f', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '288', 'Concepts of Programming'),
('ce4fea91-4186-4c0a-b8c3-0a6ee7b64d5b', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1731', 'VFX Specialization'),
('ce58ccfd-9b76-420f-a1f2-72123b44f9c0', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '297', '297-Display Advertising'),
('ce8e57cc-983d-426b-b612-1a9abb59cb5b', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1513', '1513-Arnold Renderer'),
('cf87da3d-76d7-49f6-a7f4-64a7339f0d9f', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1320', '1320-Oracle 21c PLSQL'),
('cfe8f133-b7ae-45e2-8c37-4c7717d2afb4', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '199', 'AJAX using ASP.NET'),
('d1763fb0-a1f3-4f8f-be02-96b5246de4bc', '2025-11-30 13:31:21.000000', '2025-11-30 13:31:21.000000', b'1', b'0', '47', 'Win 2K Professional'),
('d1e2e0d2-e0d5-4d13-99e5-a33907e667b5', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '251', 'Match Moving & Camera Tracking - Maya'),
('d227077b-d4fe-472a-9f53-2f244f78bcd3', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '337', 'CCNP (Routing & Switching)'),
('d294eeba-b3f8-4875-918b-51ced930e3e8', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '227', 'ToonBoom'),
('d2a1ec83-1116-4b21-9f49-3ef4bf75ca33', '2025-11-30 13:31:21.000000', '2025-11-30 13:31:21.000000', b'1', b'0', '43', 'Advanced dotNET 2003'),
('d2d53ed9-ce2b-487c-b358-5f8020663ad2', '2025-11-30 13:31:21.000000', '2025-11-30 13:31:21.000000', b'1', b'0', '91', 'Implementing RDBMS concepts with Oracle 9i'),
('d32b6f6b-923c-4092-8ac3-68311ad660fd', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '232', 'Concepts of Design'),
('d32e4741-720f-44e9-9c80-9c5f6e32dedc', '2025-11-30 13:31:21.000000', '2025-11-30 13:31:21.000000', b'1', b'0', '90', 'Oracle 9i - Administrator DBA-I'),
('d477ad9c-e5c7-4c94-9bce-6e6364d277af', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '226', 'Project Management'),
('d4bbd85a-eb14-4da4-a390-3a7c8d6249c8', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '236', 'Animation Principles with Flash'),
('d4c22de1-186c-4d60-9230-1de2ad40297f', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1295', '1295-Scratch Programming'),
('d506d714-1026-45b5-9baf-a0c9234b5f1a', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1217', '1217 IoT'),
('d5dc4923-4a13-437e-ad87-9396f17f1344', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '302', 'Installing and Configuring Windows Server 2012'),
('d5dd7f34-5754-4ba3-8d84-b050e5edcdd8', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1339', '1339-Programming in C# (VS 2022)'),
('d5dedd9f-7218-4c19-b660-46af0f3874ce', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1293', '1293-Programming in Java SE 15'),
('d6a11f2f-4d2e-4a81-81f4-24cd11da5ccd', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1347', '1347-VUEJS'),
('d78d7689-2018-4b86-98fb-47fafb0eb714', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '187', 'Google App Engine with Java'),
('d89f9edb-280e-4c59-b148-16a4937f0e7c', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '301', 'Windows 8'),
('d92595c3-68a6-4681-95a0-ea797a2c3a47', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '159', 'Windows Server 2008, Server Administrator'),
('d9a83864-4848-44cc-b5df-783f94c8fc9c', '2025-11-30 13:31:21.000000', '2025-11-30 13:31:21.000000', b'1', b'0', '73', 'ASP'),
('d9dd9903-fa60-4bb8-a3b0-efd15d767962', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '213', '213-Dream Weaver / HTML'),
('d9e00f83-d33c-43ed-aae4-2da88db23519', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '401', 'PREPRODUCTION'),
('d9e965db-6315-47bc-b4a3-0e6fe2fb98ec', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1306', '1306-Dart Programming'),
('d9fc98a9-eb87-4b8f-b4b1-87190cfc79b5', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '702', 'Grooming'),
('da16255d-5255-4d89-8b8d-695535db7c12', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '366', '366-Windows/Unix/Linux Hacking'),
('da837ebf-2996-4bbb-8669-b7dc92482355', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '361', '361-Software Development Security'),
('daff734f-0ef1-4845-ba80-0021e35f8b00', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1001', 'General Aviation & Operations'),
('db52d667-5c4c-4c2c-abd6-57d1e4a28d83', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '274', 'Digital Marketing and Media Concepts'),
('db71235a-777f-4192-ab42-bfb423b8ad40', '2025-11-30 13:31:21.000000', '2025-11-30 13:31:21.000000', b'1', b'0', '14', 'MS Srv 2k3 N/W Security - Design'),
('dbad6cc4-079c-4d5b-bc45-8f6763c7c857', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '393', '393-Search Advertising (Google Search)'),
('dc9d85a3-d2b5-4ec6-be70-11916b535728', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '605', 'World Cultures'),
('dcb96b90-a3b2-4f6e-bcb3-06d3b18dd247', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1312', '1312-Microsoft Project 2019'),
('de12e433-66b9-44ed-834d-21118e66905e', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1537', '1537-Advanced Character Animation (MAYA Unlimited 2021)'),
('de7a4d67-8b2a-4fad-b138-1dceebf56988', '2025-11-30 13:31:21.000000', '2025-11-30 13:31:21.000000', b'1', b'0', '92', 'OST-Apache - MySQL - Perl- PHP'),
('deaa991b-ceee-48ad-b31c-387a2b68a51c', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '153', 'Advanced Java SE 6 (Database and Security & Distributed Computing)'),
('ded9ba84-6054-487b-b1bf-cebde1b30f34', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1335', '1335-CCNP Enterprise (Concentration Exam 300 410 ENARSI)'),
('df844693-9ce6-4d6e-886e-e11bf132b8bf', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '353', '353-Social Engineering and User Awareness'),
('e044b442-adc9-4a4f-830b-bf94cbe404d1', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '280', '280-Game Visualization, Development Essentials'),
('e05996ef-2f81-4f16-8af2-65ff63690032', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '330', 'Administering Microsoft SQL Server 2012 Databases'),
('e0ec8898-e1cb-41a9-9586-f4b6bb6bf6bf', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '314', 'Oracle Database 11g : Administration Workshop II'),
('e12d33e2-9599-4109-a91e-8d7e825c55aa', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '351', '351-Operation Security'),
('e28afc87-266f-4ceb-8fba-4bd4dbe5f400', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '181', 'Programming in Java SE 7'),
('e28c4431-6729-430f-ad4c-f601f6771fb7', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '148', 'Java Message Service (Java EE 5)'),
('e36b06a4-d2fb-4030-83bb-40226191f9a5', '2025-11-30 13:31:21.000000', '2025-12-01 09:26:55.000000', b'1', b'0', '36', '362'),
('e3d8a998-8a77-43f6-af3d-910ac4e10ce1', '2025-11-30 13:31:21.000000', '2025-11-30 13:31:21.000000', b'1', b'0', '102', 'Red Hat Linux Enterprise Edition 5'),
('e42f82ea-5c34-4ba6-8d2d-702732163289', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1755', 'Unreal Game Engine'),
('e434db33-a1de-43f5-a3eb-81a9e54fb857', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '335', 'Xcode Application Development'),
('e46873fd-5f21-4e95-b17b-9d7df196400a', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1318', '1318-Oracle 21c Administration'),
('e523fa95-267a-430c-b8f7-cc081fb4e6f9', '2025-11-30 13:31:21.000000', '2025-11-30 13:31:21.000000', b'1', b'0', '94', 'XML Web Services with Java'),
('e52c8d5b-698c-49f7-9dba-8f18773b2871', '2025-11-30 13:31:23.000000', '2026-09-01 00:00:00.000000', b'1', b'1', '1375', '1375-Jira Project Management'),
('e541a8de-fdfe-4731-b569-de80735a217a', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '333', 'Mac OS'),
('e6042663-bb05-45ad-a8df-ea4ce4ed1cff', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '186', 'Google Reporting'),
('e7115014-71f3-43dc-ad4e-157212a9e2d8', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1523', '1523-Adobe Prmier Pro CC 2021'),
('e7686485-2245-44ea-90ed-98a31d62db49', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '134', 'Implementing a Microsoft SQL Server 2008 Database'),
('e781cdbb-8eeb-4d49-83ae-8c0cb185dcdc', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '196', 'Windows Azure and Web Services (VS 2012)'),
('e7cd3a66-2098-4bd7-8e70-2dae0acd2976', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '331', 'Implementing a Data Warehouse with Microsoft SQL Server 2012'),
('e800c9ae-5f75-404b-80ad-e3abb1dca1ce', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1272', 'Word Press'),
('e809fd24-1a2f-45da-a48e-7d80e39a13c4', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '222', 'Spin Panoroma'),
('e9364746-40da-45ca-bb55-9f0571b3025f', '2025-11-30 13:31:21.000000', '2025-11-30 13:31:21.000000', b'1', b'0', '57', 'Dreamweaver 8'),
('e9dfd55a-0f90-49d2-8883-4b657114769f', '2025-11-30 13:31:21.000000', '2025-11-30 13:31:21.000000', b'1', b'0', '111', 'Mobile Applications in .NET'),
('e9ef66bd-987a-4ef0-9bbf-0463fe80a69d', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1223', '1223-Oracle12c: PL/SQL'),
('ea7b845b-717e-40c4-8c16-6f21c69e0eca', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1343', '1343-Spring and Spring Boot'),
('ea8cf6f3-bc06-4c5c-850d-24bd315df6b6', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1517', '1517-Adobe Illustrator CC 2021'),
('ea8f126a-7f8a-4fe9-a1a5-3e96efe85194', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '703', 'Soft Skills'),
('ebb6fb30-dbbd-4ee9-b9b2-ced088fc56e3', '2025-11-30 13:31:22.000000', '2025-11-30 17:04:40.000000', b'1', b'0', '177', '177-HTML5'),
('ec60ec07-f504-4553-89b2-aab096d37d11', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '120', 'Operating System Principles'),
('ece7f8c4-11f4-4b4f-b7ad-07a21c2a6c9a', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '347', '347-Big Data'),
('ed5b9296-0186-42aa-9f6b-dc6a70b83ca7', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '816', 'General Travel & Tourism'),
('ee6e6477-ec1f-4ffa-ad24-eb5c842b543d', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1229', '1229-CCNA-Routing & Switching (100-105 & 200-105)'),
('ee877a63-9354-44ce-8ec6-bce5966f8c9b', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '370', '370-Programming in C# (VS 2015)'),
('ef0c819d-37bf-4888-b7d5-d472a9f967bd', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1355', '1355-Python for Data Science'),
('ef498142-5573-4209-833a-d46358169add', '2025-11-30 13:31:23.000000', '2025-03-01 00:00:00.000000', b'1', b'1', '1370', '1370-React Native Framework'),
('efa421cb-c902-4e56-8beb-d75d8b7e935c', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1286', '1286-Artificial Intelligence and Machine Learning'),
('f076f332-aa06-4c89-ac5d-96b837a2b0b1', '2025-11-30 13:31:21.000000', '2025-11-30 13:31:21.000000', b'1', b'0', '55', 'Desg Security for a MSWin2K Network'),
('f178418f-b896-43da-bf62-10a89773c2cc', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1310', '1310-EJB 3.1 (Java EE8)'),
('f1f7be4f-8275-4254-af6c-937424c5ecd5', '2025-11-30 13:31:21.000000', '2025-11-30 13:31:21.000000', b'1', b'0', '93', 'JSF & Strut'),
('f2ff7af7-849f-4854-ae34-0f6fff4acf70', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1338', '1338-Core and Advanced Java 19.x'),
('f3189fb7-dbdb-4627-b337-f01662cc7d48', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '263', 'Adobe Audition'),
('f33a6b8a-9aee-4caf-89a6-30af730d0db8', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1326', '1326-Game Development with C# and Unity'),
('f35a1644-2850-4bf5-a334-36fa1b162093', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '389', '389-Amazon Web Services (AWS)-PHP'),
('f499da83-cc8b-468b-b4f1-d56787496f9d', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '158', 'Windows Server 2008 Active Directory Configuring'),
('f5387ceb-0165-4cf6-beaa-4b7da530e57d', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1250', 'eCommerce'),
('f55d8e41-55d4-4f1e-a9b9-b0b771dc4a1e', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '357', '357-Database Management(Database Security and Development)'),
('f6279ffe-22c8-47c5-bf97-d9a8f41e46dc', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '296', '296-Search Marketing'),
('f68cbefd-c429-4d9d-b00b-b93b2e6ab196', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '136', 'Designing, Optimizing, and Maintaining SQL Server 2008 Servers'),
('f69364dd-e090-4a41-8136-c5f0a3c34b26', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1290', 'Oracle ERP'),
('f76d3fe1-a38b-45f1-b1c4-b1974d6a3416', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1324', '1324-Azure Architect Design (AZ-304)'),
('f77af967-148a-49b6-b898-cbe7496be7a4', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '201', '201-Illustrator, Corel Draw, FCM and BA'),
('f84540d3-3030-4b1d-8b4b-b5e6018a8a72', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '130', 'Visual Studio 2008: ADO.NET 3.5'),
('f848854b-60f5-427d-977c-f554edecb0f0', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1503', '1503-Content Marketing'),
('f90d923f-253d-45f7-843a-284c16a3d293', '2025-11-30 13:31:21.000000', '2025-12-01 09:26:55.000000', b'1', b'0', '16', '366'),
('f973946f-11f0-4b15-bdb1-eeb667f2e4b8', '2025-11-30 13:31:21.000000', '2025-11-30 13:31:21.000000', b'1', b'0', '115', 'SL 351 - Advanced Business Component Development with Enterprise JavaBeans Technology (Java EE 5)'),
('f97f3962-e0d2-45af-b2b3-4f884c600ea6', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '184', 'Google Advertising Fundamentals'),
('fb5a2e36-6832-44fd-b3e4-7787f9f0ac9e', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '192', 'Programming in C# (VS 2012)'),
('fc3dce57-3ee6-4448-955c-ab1f8e01901d', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1504', 'Affiliate Marketing'),
('fcbb5825-532a-4ce1-922e-12860767f6b6', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '371', '371-Windows Store Apps using C# (VS 2015)'),
('fcc5c08d-33d9-40bb-8eb8-4463842f5917', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '143', 'Windows Presentation Foundation'),
('fcf89317-34b3-45bd-9e22-ebb78e75ce42', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '144', 'Essential Features of .NET Framework 4.0'),
('fcf926f0-7bc4-43d0-9359-22308a87b3ea', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '129', 'Hibernate'),
('fd301e68-fee9-42e7-8514-085e833c1354', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '234', 'Concepts of Color');
INSERT INTO `skills` (`id`, `creation_timestamp`, `update_timestamp`, `is_active`, `is_new`, `skill_code`, `skill_name`) VALUES
('fd8b902c-e4b0-4ef1-b508-16b492f5afe3', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1514', '1514-Blender'),
('fd8c1dc4-e9f2-4e9b-a250-550e344a9a46', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '205', 'Director'),
('fde030f6-6753-4c43-9748-fcf47c523dea', '2025-11-30 13:31:23.000000', '2025-11-30 13:31:23.000000', b'1', b'0', '1707', 'Digital Film Making & Stop Motion'),
('fe5fb8a3-e054-4e81-bc1b-0436477f1027', '2025-11-30 13:31:21.000000', '2025-11-30 13:31:21.000000', b'1', b'0', '72', 'SQLJ Programming'),
('fe7d1a6f-90e5-423e-9da6-4faa403d8872', '2025-11-30 13:31:23.000000', '2025-06-01 00:00:00.000000', b'1', b'1', '1566', '1566-Figma'),
('ffc7be8e-bb3a-42d8-9d99-ff9ce208ef62', '2025-11-30 13:31:22.000000', '2025-11-30 13:31:22.000000', b'1', b'0', '244', 'GAME DESIGN & CONCEPTS');

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
('01cca446-63fa-4e6b-975d-532afad151a5', '2025-12-01 14:23:29.000000', '2025-12-01 14:23:29.000000', NULL, b'1', b'0', 'SEMESTER_1', 'Inferential Statistical Analysis', NULL, '49a36801-1e94-49fa-80ed-97547dad91c3', 'fd994a46-3e46-40fd-bbc4-563641cc928a'),
('0b307945-0389-4ad1-a7d5-409b256ccdd0', '2025-12-01 14:23:33.000000', '2025-12-01 14:23:33.000000', NULL, b'1', b'0', 'SEMESTER_1', 'eProject-Responsive Web Development', NULL, 'ebb6fb30-dbbd-4ee9-b9b2-ced088fc56e3', '3abe3528-a24e-4265-9aec-36f6d1c598fd'),
('0cf6013e-bd05-41c9-ab19-1adedbdbaeed', '2025-12-01 14:23:37.000000', '2025-12-01 14:23:37.000000', NULL, b'1', b'0', 'SEMESTER_1', 'Responsive UI/UX Strategies', NULL, '00fcf888-b6cd-41cb-9ed6-41722c68eb5a', 'ee744a66-5d47-4322-97a0-bf5bbfea4db3'),
('0d8d9c5b-6459-4788-8d04-6b56ab7d6407', '2025-12-01 14:23:49.000000', '2025-12-01 14:23:49.000000', NULL, b'1', b'0', 'SEMESTER_3', 'Creating Motion Graphics', NULL, '5fcee334-8caf-4a5e-b94a-7b388949c396', '072dbc3e-5b95-4c20-8c52-00903c3a4178'),
('10da5c8a-f019-4673-9128-efd3405acd52', '2025-12-01 14:23:37.000000', '2025-12-01 14:23:37.000000', NULL, b'1', b'0', 'SEMESTER_2', 'Proficient Programming with C#', NULL, 'd5dd7f34-5754-4ba3-8d84-b050e5edcdd8', 'ee744a66-5d47-4322-97a0-bf5bbfea4db3'),
('11a72044-e575-48d8-b46f-8843b2994e1d', '2025-12-01 14:23:49.000000', '2025-12-01 14:23:49.000000', NULL, b'1', b'0', 'SEMESTER_1', 'Typography Design', NULL, '5fcafbe6-28bd-4ad5-9eb5-d2c38ec56a17', '072dbc3e-5b95-4c20-8c52-00903c3a4178'),
('12f9536d-af19-4b64-95ab-20f812567c92', '2025-12-01 14:23:33.000000', '2025-12-01 14:23:33.000000', NULL, b'1', b'0', 'SEMESTER_3', 'Large Data Management (MongoDB)', NULL, 'a77d364e-c344-40f7-bcae-2dc5b7944ecd', '3abe3528-a24e-4265-9aec-36f6d1c598fd'),
('1368f354-62c3-4b18-8704-b54eded58dd9', '2025-12-01 14:23:37.000000', '2025-12-01 14:23:37.000000', NULL, b'1', b'0', 'SEMESTER_3', 'AI Primer', NULL, NULL, 'ee744a66-5d47-4322-97a0-bf5bbfea4db3'),
('1413d21b-1d17-4ad3-abdf-43e8c3c3de29', '2025-12-01 14:23:49.000000', '2025-12-01 14:23:49.000000', NULL, b'1', b'0', 'SEMESTER_4', 'Digital Preproduction', NULL, '2c00da58-a558-4734-b841-1e7c07bd1ee3', '072dbc3e-5b95-4c20-8c52-00903c3a4178'),
('1504207e-4898-43d6-8b01-a4db5a626fca', '2025-12-01 14:23:49.000000', '2025-12-01 14:23:49.000000', NULL, b'1', b'0', 'SEMESTER_3', 'Storyboarding', NULL, '3458882b-819c-4f6c-8e1c-10617c81cfcf', '072dbc3e-5b95-4c20-8c52-00903c3a4178'),
('17115b3b-ed56-4894-a579-7a59381dd3cd', '2025-12-01 14:23:49.000000', '2025-12-01 14:23:49.000000', NULL, b'1', b'0', 'SEMESTER_3', 'Digital Soundtrack', NULL, '2a5f6928-4104-49ed-9740-19664a6c717e', '072dbc3e-5b95-4c20-8c52-00903c3a4178'),
('19bae402-b205-4e21-9cd4-c89cca5d4f25', '2025-12-01 14:23:53.000000', '2025-12-01 14:23:53.000000', NULL, b'1', b'0', 'SEMESTER_1', 'Routing Technology', NULL, 'a8a560fe-4f24-4983-b0fd-818fe6040772', '3dc6391c-04e0-476d-b84d-4611d853ae41'),
('1a40959f-c63f-4cca-b093-5925ca4c8fa1', '2025-12-01 14:23:37.000000', '2025-12-01 14:23:37.000000', NULL, b'1', b'0', 'SEMESTER_4', 'Creating Services for the Web', NULL, NULL, 'ee744a66-5d47-4322-97a0-bf5bbfea4db3'),
('1ab307c2-f6f9-4d93-a72a-aa91962e5067', '2025-12-01 14:23:49.000000', '2025-12-01 14:23:49.000000', NULL, b'1', b'0', 'SEMESTER_2', 'Web Designing Concepts', NULL, 'd9dd9903-fa60-4bb8-a3b0-efd15d767962', '072dbc3e-5b95-4c20-8c52-00903c3a4178'),
('1ae91ef3-fef2-41de-a5e1-77d7695a7112', '2025-12-01 14:23:37.000000', '2025-12-01 14:23:37.000000', NULL, b'1', b'0', 'SEMESTER_2', 'Programming with Python', NULL, '1cd3bb58-0e56-4cfe-b81e-e926b99df104', 'ee744a66-5d47-4322-97a0-bf5bbfea4db3'),
('1dd9a509-65af-44ab-b4e8-9923204c2a83', '2025-12-01 14:23:49.000000', '2025-12-01 14:23:49.000000', NULL, b'1', b'0', 'SEMESTER_1', 'Magic with Images', NULL, '78bc9900-b203-436f-9cbb-ad3791551091', '072dbc3e-5b95-4c20-8c52-00903c3a4178'),
('1e449c30-cbf6-4628-a9ed-25878d9027a0', '2025-12-01 14:23:50.000000', '2025-12-01 14:23:50.000000', NULL, b'1', b'0', 'SEMESTER_4', 'Digital Compositing', NULL, '8c5a7a5f-bfcc-4847-b9ca-5db1e7d792a6', '072dbc3e-5b95-4c20-8c52-00903c3a4178'),
('1f266c8d-113a-4aa3-92a8-1b1e9f91e5ad', '2025-12-01 14:23:33.000000', '2025-12-01 14:23:33.000000', NULL, b'1', b'0', 'SEMESTER_3', 'Essentials of NodeJS', NULL, '2d11f193-8c8c-4558-b616-266363778980', '3abe3528-a24e-4265-9aec-36f6d1c598fd'),
('245a31a8-b139-4358-819d-f8193d4e2c30', '2025-12-01 14:23:37.000000', '2025-12-01 14:23:37.000000', NULL, b'1', b'0', 'SEMESTER_1', 'eProject - Laravel and PHP Application Development +\nWeb Design for Responsive Development', NULL, '4fd7b493-0cb3-47c9-b4d8-e88e5862ea79', 'ee744a66-5d47-4322-97a0-bf5bbfea4db3'),
('28284805-09ee-496e-ad17-f9fae3777772', '2025-12-01 14:23:49.000000', '2025-12-01 14:23:49.000000', NULL, b'1', b'0', 'SEMESTER_3', 'Texturing of Game Asset', NULL, '85c779b8-3bec-487c-b56b-bb4e3247afb9', '072dbc3e-5b95-4c20-8c52-00903c3a4178'),
('2a46059c-7bde-4abd-85b3-f0fa912cb469', '2025-12-01 14:23:49.000000', '2025-12-01 14:23:49.000000', NULL, b'1', b'0', 'SEMESTER_2', 'UI Design', NULL, 'cac4092d-0600-4140-affb-4c6b6ce9da5c', '072dbc3e-5b95-4c20-8c52-00903c3a4178'),
('2b78e019-ef63-4331-8c98-d691241ce711', '2025-12-01 14:23:33.000000', '2025-12-01 14:23:33.000000', NULL, b'1', b'0', 'SEMESTER_2', 'Java Programming - II', NULL, 'f2ff7af7-849f-4854-ae34-0f6fff4acf70', '3abe3528-a24e-4265-9aec-36f6d1c598fd'),
('2c7ac604-5672-4143-bc22-90cb16f9cf23', '2025-12-01 14:23:49.000000', '2025-12-01 14:23:49.000000', NULL, b'1', b'0', 'SEMESTER_3', 'Introduction to Blender', NULL, 'fd8b902c-e4b0-4ef1-b508-16b492f5afe3', '072dbc3e-5b95-4c20-8c52-00903c3a4178'),
('2d9d2a83-f16e-4dbe-9f6f-076f73a1ffe3', '2025-12-01 14:23:33.000000', '2025-12-01 14:23:33.000000', NULL, b'1', b'0', 'SEMESTER_4', 'Introduction to Dart Programming', NULL, 'd9e965db-6315-47bc-b4a3-0e6fe2fb98ec', '3abe3528-a24e-4265-9aec-36f6d1c598fd'),
('32cf39f1-e33b-4ead-9703-cd1339378ae7', '2025-12-01 14:23:37.000000', '2025-12-01 14:23:37.000000', NULL, b'1', b'0', 'SEMESTER_2', 'Data Processing with XML and JSON', NULL, 'a1774ce0-2814-419d-ad67-1415f79dd351', 'ee744a66-5d47-4322-97a0-bf5bbfea4db3'),
('339d7af6-e91a-487f-9030-e953b5e2fcad', '2025-12-01 14:23:37.000000', '2025-12-01 14:23:37.000000', NULL, b'1', b'0', 'SEMESTER_4', 'Deployment System and Containerize with Docker\nand Kubernetes', NULL, NULL, 'ee744a66-5d47-4322-97a0-bf5bbfea4db3'),
('34590aa2-bb2e-438f-b9e9-e9ba12215f89', '2025-12-01 14:23:37.000000', '2025-12-01 14:23:37.000000', NULL, b'1', b'0', 'SEMESTER_3', 'eProject-Crafting .NET Applications', NULL, NULL, 'ee744a66-5d47-4322-97a0-bf5bbfea4db3'),
('3613b492-979d-43ad-8713-56e6f2fb291a', '2025-12-01 14:23:50.000000', '2025-12-01 14:23:50.000000', NULL, b'1', b'0', 'SEMESTER_4', 'Texturing 3D Objects with Maya', NULL, '9af3a2d2-db08-4fb2-84ce-59eb68f6a7a1', '072dbc3e-5b95-4c20-8c52-00903c3a4178'),
('3a1b8c22-4d4b-4cec-96a7-80bbaa8af4e0', '2025-12-01 14:23:37.000000', '2025-12-01 14:23:37.000000', NULL, b'1', b'0', 'SEMESTER_1', 'Building Next-Level Dynamic Websites', NULL, 'ebb6fb30-dbbd-4ee9-b9b2-ced088fc56e3', 'ee744a66-5d47-4322-97a0-bf5bbfea4db3'),
('43e6d043-4e56-4ae8-a0b6-6bd6b9e4e1d1', '2025-12-01 14:23:49.000000', '2025-12-01 14:23:49.000000', NULL, b'1', b'0', 'SEMESTER_1', 'Digital Art', NULL, 'ea8cf6f3-bc06-4c5c-850d-24bd315df6b6', '072dbc3e-5b95-4c20-8c52-00903c3a4178'),
('441aa2e5-0e63-442c-99e5-281f653a1d77', '2025-12-01 14:23:29.000000', '2025-12-01 14:23:29.000000', NULL, b'1', b'0', 'SEMESTER_1', 'Project-Analyzing Data with R', NULL, '973c18ce-198d-4184-bbd4-016d7fa4b3dd', 'fd994a46-3e46-40fd-bbc4-563641cc928a'),
('49225e79-f349-41f2-9191-6e9c6859375b', '2025-12-01 14:23:33.000000', '2025-12-01 14:23:33.000000', NULL, b'1', b'0', 'SEMESTER_1', 'PHP Development with Laravel Framework', NULL, '11818c6e-7e54-49d3-8532-1c1a11f07a9b', '3abe3528-a24e-4265-9aec-36f6d1c598fd'),
('511ea932-3b9e-4942-bab6-82f09b496ccf', '2025-12-01 14:23:33.000000', '2025-12-01 14:23:33.000000', NULL, b'1', b'0', 'SEMESTER_2', 'Java Programming - I', NULL, 'f2ff7af7-849f-4854-ae34-0f6fff4acf70', '3abe3528-a24e-4265-9aec-36f6d1c598fd'),
('517bbe4d-0da2-485a-a53f-159ff62e9b2d', '2025-12-01 14:23:33.000000', '2025-12-01 14:23:33.000000', NULL, b'1', b'0', 'SEMESTER_1', 'Data Management with SQL Server', NULL, 'cb41ef50-b00c-4ca4-9d89-04d618be153b', '3abe3528-a24e-4265-9aec-36f6d1c598fd'),
('5272bc22-bc4b-4d5f-b1b5-b2879f40f39f', '2025-12-01 14:23:49.000000', '2025-12-01 14:23:49.000000', NULL, b'1', b'0', 'SEMESTER_3', 'Portfolio-3D Game design (Project)', NULL, '0f9c106f-b55c-4a15-95f2-30672f00b012', '072dbc3e-5b95-4c20-8c52-00903c3a4178'),
('546cacac-5ad5-46a5-b7cc-f66c1e05de3a', '2025-12-01 14:23:49.000000', '2025-12-01 14:23:49.000000', NULL, b'1', b'0', 'SEMESTER_1', 'Print Portfolio (Project)', NULL, '403ae685-0153-4cd7-9e52-016dfccea82d', '072dbc3e-5b95-4c20-8c52-00903c3a4178'),
('54853141-c48f-4b3e-baf4-8d0da6b36ae0', '2025-12-01 14:23:53.000000', '2025-12-01 14:23:53.000000', NULL, b'1', b'0', 'SEMESTER_1', 'Introduction to Ethical Hacking', NULL, '95781dfd-6dae-4a13-b8d8-6a13ae24d9a7', '3dc6391c-04e0-476d-b84d-4611d853ae41'),
('54afd0ac-3fc4-49f8-86aa-cf03d9af571d', '2025-12-01 14:23:33.000000', '2025-12-01 14:23:33.000000', NULL, b'1', b'0', 'SEMESTER_4', 'Building Java Web Applications with Spring Framework', NULL, 'ea7b845b-717e-40c4-8c16-6f21c69e0eca', '3abe3528-a24e-4265-9aec-36f6d1c598fd'),
('570a730a-6af9-4a83-bb7c-91c09f317b7d', '2025-12-01 14:23:33.000000', '2025-12-01 14:23:33.000000', NULL, b'1', b'0', 'SEMESTER_3', 'DevelopingASP.NET Core MVC Applications', NULL, '89870be2-6419-4b5d-ab7d-8e303692b643', '3abe3528-a24e-4265-9aec-36f6d1c598fd'),
('5764bd5f-aa39-4872-a91d-18fcabb6f28f', '2025-12-01 14:23:33.000000', '2025-12-01 14:23:33.000000', NULL, b'1', b'0', 'SEMESTER_2', 'Data Processing with XML and JSON', NULL, 'a1774ce0-2814-419d-ad67-1415f79dd351', '3abe3528-a24e-4265-9aec-36f6d1c598fd'),
('5792cdc7-7f59-4b64-b889-2eeb579d3d23', '2025-12-01 14:23:49.000000', '2025-12-01 14:23:49.000000', NULL, b'1', b'0', 'SEMESTER_3', 'Retopology of Game Asset', NULL, 'fd8b902c-e4b0-4ef1-b508-16b492f5afe3', '072dbc3e-5b95-4c20-8c52-00903c3a4178'),
('59ac37d1-f8a6-4180-b5bb-91e6b0dedafa', '2025-12-01 14:23:37.000000', '2025-12-01 14:23:37.000000', NULL, b'1', b'0', 'SEMESTER_2', 'Distributed Version Control', NULL, '830e2a23-0286-4c6b-a00a-73ef0c5de171', 'ee744a66-5d47-4322-97a0-bf5bbfea4db3'),
('5ad58bfb-3142-4ff9-8753-21b24ffa06d8', '2025-12-01 14:23:32.000000', '2025-12-01 14:23:32.000000', NULL, b'1', b'0', 'SEMESTER_1', 'UI/UX for Responsive Web Design', NULL, '00fcf888-b6cd-41cb-9ed6-41722c68eb5a', '3abe3528-a24e-4265-9aec-36f6d1c598fd'),
('5bb5451f-9714-4c7f-8d2f-5c7c8b97044a', '2025-12-01 14:23:53.000000', '2025-12-01 14:23:53.000000', NULL, b'1', b'0', 'SEMESTER_1', 'Handheld Devices Security', NULL, '7ed4f9d2-f108-478b-89a8-432eb3a60689', '3dc6391c-04e0-476d-b84d-4611d853ae41'),
('5ee0e883-91d9-4565-8f2e-43053c9af8f9', '2025-12-01 14:23:29.000000', '2025-12-01 14:23:29.000000', NULL, b'1', b'0', 'SEMESTER_1', 'Application Based Programming in Python', NULL, '1cd3bb58-0e56-4cfe-b81e-e926b99df104', 'fd994a46-3e46-40fd-bbc4-563641cc928a'),
('63c1279d-3264-4f58-b0ef-08aac8827ff2', '2025-12-01 14:23:33.000000', '2025-12-01 14:23:33.000000', NULL, b'1', b'0', 'SEMESTER_3', 'eProject -.NET Web Application Development', NULL, '6eaadacb-61eb-45b0-8e18-140ce92da395', '3abe3528-a24e-4265-9aec-36f6d1c598fd'),
('65c8f200-553c-4e19-867c-3d355c351c44', '2025-12-01 14:23:53.000000', '2025-12-01 14:23:53.000000', NULL, b'1', b'0', 'SEMESTER_1', 'Information Security and Organisational Structure', NULL, '21db8fa3-6163-4e36-8447-ec5a8bbccbce', '3dc6391c-04e0-476d-b84d-4611d853ae41'),
('68ca3724-604f-4f17-9831-9e78e92cb8fa', '2025-12-01 14:23:49.000000', '2025-12-01 14:23:49.000000', NULL, b'1', b'0', 'SEMESTER_1', 'Design for Print and Advertising', NULL, 'ad1b61cc-c799-456a-8b14-b7d63b0387d1', '072dbc3e-5b95-4c20-8c52-00903c3a4178'),
('6a20e2ac-1d2b-4f5d-9d49-f3ef64042b0d', '2025-12-01 14:23:33.000000', '2025-12-01 14:23:33.000000', NULL, b'1', b'0', 'SEMESTER_3', 'Developing Applications with Python', NULL, '1cd3bb58-0e56-4cfe-b81e-e926b99df104', '3abe3528-a24e-4265-9aec-36f6d1c598fd'),
('6e43ab85-0bc3-4927-8828-bd0a1a85bc4b', '2025-12-01 14:23:37.000000', '2025-12-01 14:23:37.000000', NULL, b'1', b'0', 'SEMESTER_4', 'Enterprise Application Development in Jakarta EE', NULL, NULL, 'ee744a66-5d47-4322-97a0-bf5bbfea4db3'),
('6f51682d-7fce-44c8-b926-7e0fcbdcdf35', '2025-12-01 14:23:33.000000', '2025-12-01 14:23:33.000000', NULL, b'1', b'0', 'SEMESTER_4', 'Project-Java Enterprise Application Development', NULL, '1d75685c-37cf-42d3-9280-f02e346d1fdf', '3abe3528-a24e-4265-9aec-36f6d1c598fd'),
('6fa94e22-7d9c-4402-ace2-2fca18976574', '2025-12-01 14:23:37.000000', '2025-12-01 14:23:37.000000', NULL, b'1', b'0', 'SEMESTER_2', 'Core Java Concepts and Techniques', NULL, 'f2ff7af7-849f-4854-ae34-0f6fff4acf70', 'ee744a66-5d47-4322-97a0-bf5bbfea4db3'),
('72251834-2240-4b35-ad99-963a73342293', '2025-12-01 14:23:37.000000', '2025-12-01 14:23:37.000000', NULL, b'1', b'0', 'SEMESTER_3', 'Introduction to Dart Programming', NULL, NULL, 'ee744a66-5d47-4322-97a0-bf5bbfea4db3'),
('72477199-6a22-4eb4-a973-873dc6f330d2', '2025-12-01 14:23:33.000000', '2025-12-01 14:23:33.000000', NULL, b'1', b'0', 'SEMESTER_4', 'Creating Services for the Web', NULL, '1d75685c-37cf-42d3-9280-f02e346d1fdf', '3abe3528-a24e-4265-9aec-36f6d1c598fd'),
('74357793-e781-405b-ae78-2aaf662ed2b3', '2025-12-01 14:23:37.000000', '2025-12-01 14:23:37.000000', NULL, b'1', b'0', 'SEMESTER_1', 'React for Modern Web Development', NULL, '70e60dae-6a24-4a7b-87f1-bb23fe45bdc7', 'ee744a66-5d47-4322-97a0-bf5bbfea4db3'),
('7552ccde-52fa-4d85-b307-515257501cfb', '2025-12-01 14:23:33.000000', '2025-12-01 14:23:33.000000', NULL, b'1', b'0', 'SEMESTER_4', 'Web Component Development using Jakarta EE', NULL, '1d75685c-37cf-42d3-9280-f02e346d1fdf', '3abe3528-a24e-4265-9aec-36f6d1c598fd'),
('779fd5c1-e50f-42b4-9496-8f7753f1e2e3', '2025-12-01 14:23:53.000000', '2025-12-01 14:23:53.000000', NULL, b'1', b'0', 'SEMESTER_1', 'Windows and Linux Hacking', NULL, 'f90d923f-253d-45f7-843a-284c16a3d293', '3dc6391c-04e0-476d-b84d-4611d853ae41'),
('7812d516-1a91-4172-b43a-cf8f9fa6ce17', '2025-12-01 14:23:49.000000', '2025-12-01 14:23:49.000000', NULL, b'1', b'0', 'SEMESTER_2', 'Web Page Design', NULL, '152f0f8e-d082-488a-aa2d-b826e655b7ef', '072dbc3e-5b95-4c20-8c52-00903c3a4178'),
('785800ec-0e4e-4374-a1b9-3fffc59d25a9', '2025-12-01 14:23:50.000000', '2025-12-01 14:23:50.000000', NULL, b'1', b'0', 'SEMESTER_4', 'Lighting and Rendering 3D Objects with Maya', NULL, '306ef211-a744-4dc5-8cc5-eab8089cb7c9', '072dbc3e-5b95-4c20-8c52-00903c3a4178'),
('7876c256-566b-488d-afb1-f4fbf088a175', '2025-12-01 14:23:53.000000', '2025-12-01 14:23:53.000000', NULL, b'1', b'0', 'SEMESTER_1', 'Social Media Forensics', NULL, '7ed4f9d2-f108-478b-89a8-432eb3a60689', '3dc6391c-04e0-476d-b84d-4611d853ae41'),
('8677c221-9d38-41ac-bf62-6a043b54cbe8', '2025-12-01 14:23:32.000000', '2025-12-01 14:23:32.000000', NULL, b'1', b'0', 'SEMESTER_1', 'Building Modern Websites', NULL, 'ebb6fb30-dbbd-4ee9-b9b2-ced088fc56e3', '3abe3528-a24e-4265-9aec-36f6d1c598fd'),
('871f8b2f-1cf4-4851-ae5e-6d309b350d6f', '2025-12-01 14:23:49.000000', '2025-12-01 14:23:49.000000', NULL, b'1', b'0', 'SEMESTER_2', 'Web Animation', NULL, 'c36ec9d4-edca-461f-a172-bcbb5ead8a74', '072dbc3e-5b95-4c20-8c52-00903c3a4178'),
('8a0bc5e0-0687-49dd-9ea2-59b8e225475c', '2025-12-01 14:23:29.000000', '2025-12-01 14:23:29.000000', NULL, b'1', b'0', 'SEMESTER_1', 'Managing Large datasets with MongoDB', NULL, 'a77d364e-c344-40f7-bcae-2dc5b7944ecd', 'fd994a46-3e46-40fd-bbc4-563641cc928a'),
('8c1f2e2e-4354-45e1-98fd-8cb0e12fb5aa', '2025-12-01 14:23:37.000000', '2025-12-01 14:23:37.000000', NULL, b'1', b'0', 'SEMESTER_2', 'Building Rich Java Applications with JavaFX', NULL, 'f2ff7af7-849f-4854-ae34-0f6fff4acf70', 'ee744a66-5d47-4322-97a0-bf5bbfea4db3'),
('8e076093-72b5-461d-bfef-b19e543d2c26', '2025-12-01 14:23:50.000000', '2025-12-01 14:23:50.000000', NULL, b'1', b'0', 'SEMESTER_4', 'Character Animation with Maya', NULL, 'de12e433-66b9-44ed-834d-21118e66905e', '072dbc3e-5b95-4c20-8c52-00903c3a4178'),
('8e0f97bf-e656-4bf8-ae41-0e9c6e4829bf', '2025-12-01 14:23:49.000000', '2025-12-01 14:23:49.000000', NULL, b'1', b'0', 'SEMESTER_3', 'Concepts of Digital Film Making', NULL, 'a0357052-6ef1-4e2d-b28d-b2b5993fe8c6', '072dbc3e-5b95-4c20-8c52-00903c3a4178'),
('8f057b7a-93b2-43a1-9bee-6e335ef032f6', '2025-12-01 14:23:37.000000', '2025-12-01 14:23:37.000000', NULL, b'1', b'0', 'SEMESTER_4', 'Java Web Applications with Spring and Spring Boot', NULL, NULL, 'ee744a66-5d47-4322-97a0-bf5bbfea4db3'),
('8fa2ce86-2521-4578-b8b5-4f89f9ab3c31', '2025-12-01 14:23:49.000000', '2025-12-01 14:23:49.000000', NULL, b'1', b'0', 'SEMESTER_3', 'Level Designing', NULL, '0f9c106f-b55c-4a15-95f2-30672f00b012', '072dbc3e-5b95-4c20-8c52-00903c3a4178'),
('9a87eaa8-160b-4192-b082-dfecad226e51', '2025-12-01 14:23:37.000000', '2025-12-01 14:23:37.000000', NULL, b'1', b'0', 'SEMESTER_4', 'AI Applications of NLP', NULL, NULL, 'ee744a66-5d47-4322-97a0-bf5bbfea4db3'),
('9deaf4c7-9df0-4a6b-9edb-2c810158ef16', '2025-12-01 14:23:37.000000', '2025-12-01 14:23:37.000000', NULL, b'1', b'0', 'SEMESTER_1', 'Modern PHP Applications with Laravel', NULL, '4fd7b493-0cb3-47c9-b4d8-e88e5862ea79', 'ee744a66-5d47-4322-97a0-bf5bbfea4db3'),
('9f9e3fc8-9637-4d54-bdee-4d3b739ec1a9', '2025-12-01 14:23:37.000000', '2025-12-01 14:23:37.000000', NULL, b'1', b'0', 'SEMESTER_2', 'Project-Java Desktop Application Development', NULL, 'f2ff7af7-849f-4854-ae34-0f6fff4acf70', 'ee744a66-5d47-4322-97a0-bf5bbfea4db3'),
('9fcd10d8-ce3a-46d5-b84b-daa09d7d6c07', '2025-12-01 14:23:49.000000', '2025-12-01 14:23:49.000000', NULL, b'1', b'0', 'SEMESTER_2', 'UI and UX for Responsive Web Design', NULL, '104baf54-76f4-4faf-833b-23bc003acd12', '072dbc3e-5b95-4c20-8c52-00903c3a4178'),
('a28501c9-6a1b-458b-b8b0-743ece4bab51', '2025-12-01 14:23:50.000000', '2025-12-01 14:23:50.000000', NULL, b'1', b'0', 'SEMESTER_4', 'Portfolio development with Demo Reel (eProject)', NULL, '8a1074bb-3b35-493d-ba03-f8bf6b135209', '072dbc3e-5b95-4c20-8c52-00903c3a4178'),
('a638dc9c-40a7-46df-b852-d3efd6d4b0f1', '2025-12-01 14:23:37.000000', '2025-12-01 14:23:37.000000', NULL, b'1', b'0', 'SEMESTER_3', 'Generative AI for .NET Developers with Google AI', NULL, NULL, 'ee744a66-5d47-4322-97a0-bf5bbfea4db3'),
('a6c02e4b-2ec3-4106-949f-4c5813e04d74', '2025-12-01 14:23:33.000000', '2025-12-01 14:23:33.000000', NULL, b'1', b'0', 'SEMESTER_3', 'Emergingjob Areas-SMAC', NULL, '765f05c2-1177-41bd-90c4-cfb956833e92', '3abe3528-a24e-4265-9aec-36f6d1c598fd'),
('a8a6bca5-c109-4556-8c37-549f10687544', '2025-12-01 14:23:49.000000', '2025-12-01 14:23:49.000000', NULL, b'1', b'0', 'SEMESTER_1', 'Publishing for the Media', NULL, '403ae685-0153-4cd7-9e52-016dfccea82d', '072dbc3e-5b95-4c20-8c52-00903c3a4178'),
('ab5a537a-fc70-4ab7-9419-4043f0eb1a1b', '2025-12-01 14:23:37.000000', '2025-12-01 14:23:37.000000', NULL, b'1', b'0', 'SEMESTER_2', 'Django Framework for Python', NULL, '03e15f35-ded1-42e7-ae9f-1e5ba486886e', 'ee744a66-5d47-4322-97a0-bf5bbfea4db3'),
('abf39662-ea4a-4b8d-a7db-ce52bcb5da3e', '2025-12-01 14:23:49.000000', '2025-12-01 14:23:49.000000', NULL, b'1', b'0', 'SEMESTER_1', 'Lightroom for Photographers', NULL, '4fdb1527-223e-4d38-b169-d0601fddcb87', '072dbc3e-5b95-4c20-8c52-00903c3a4178'),
('b173fdef-9106-4da5-ad68-0ac0424a0c55', '2025-12-01 14:23:53.000000', '2025-12-01 14:23:53.000000', NULL, b'1', b'0', 'SEMESTER_1', 'Forensic Investigation', NULL, '7ed4f9d2-f108-478b-89a8-432eb3a60689', '3dc6391c-04e0-476d-b84d-4611d853ae41'),
('b2fdf942-5d91-4841-9d96-ee648be09c91', '2025-12-01 14:23:33.000000', '2025-12-01 14:23:33.000000', NULL, b'1', b'0', 'SEMESTER_1', 'Frontend Web Development with React', NULL, '70e60dae-6a24-4a7b-87f1-bb23fe45bdc7', '3abe3528-a24e-4265-9aec-36f6d1c598fd'),
('b6c0d278-038b-41ba-b250-72169ad8f67c', '2025-12-01 14:23:33.000000', '2025-12-01 14:23:33.000000', NULL, b'1', b'0', 'SEMESTER_4', 'Enterprise Application Development in Jakarta EE', NULL, '1d75685c-37cf-42d3-9280-f02e346d1fdf', '3abe3528-a24e-4265-9aec-36f6d1c598fd'),
('b8daa808-2a5d-4224-8157-de1422e11987', '2025-12-01 14:23:50.000000', '2025-12-01 14:23:50.000000', NULL, b'1', b'0', 'SEMESTER_4', 'Rigging 3D Objects with MAYA', NULL, '8a1074bb-3b35-493d-ba03-f8bf6b135209', '072dbc3e-5b95-4c20-8c52-00903c3a4178'),
('b933e703-0ebf-4c74-b668-efaa23afcd07', '2025-12-01 14:23:32.000000', '2025-12-01 14:23:32.000000', NULL, b'1', b'0', 'SEMESTER_1', 'Logic Building and Elementary Programming', NULL, '2da7b0d3-d3cf-45a1-ace0-f6f5a5981ef5', '3abe3528-a24e-4265-9aec-36f6d1c598fd'),
('b9766ba0-7eff-46d8-9066-af64997b170b', '2025-12-01 14:23:37.000000', '2025-12-01 14:23:37.000000', NULL, b'1', b'0', 'SEMESTER_1', 'Foundations of Programming with C', NULL, '2da7b0d3-d3cf-45a1-ace0-f6f5a5981ef5', 'ee744a66-5d47-4322-97a0-bf5bbfea4db3'),
('ba3080bf-ae9f-4fcd-8447-df9265c18f33', '2025-12-01 14:23:53.000000', '2025-12-01 14:23:53.000000', NULL, b'1', b'0', 'SEMESTER_1', 'Introduction to Cyber Forensics', NULL, '7ed4f9d2-f108-478b-89a8-432eb3a60689', '3dc6391c-04e0-476d-b84d-4611d853ae41'),
('be5cf167-eb75-4f7e-a634-8d35a455e6de', '2025-12-01 14:23:29.000000', '2025-12-01 14:23:29.000000', NULL, b'1', b'0', 'SEMESTER_1', 'Data Science using R Programming', NULL, '973c18ce-198d-4184-bbd4-016d7fa4b3dd', 'fd994a46-3e46-40fd-bbc4-563641cc928a'),
('c0640e4b-9359-4177-8c09-e373733a05c0', '2025-12-01 14:23:37.000000', '2025-12-01 14:23:37.000000', NULL, b'1', b'0', 'SEMESTER_1', 'Managing Data with SQL Server', NULL, '67a47ec1-7998-4b8f-8754-5246445604da', 'ee744a66-5d47-4322-97a0-bf5bbfea4db3'),
('c0e29462-4dc3-4ebe-a838-2c81094b99d9', '2025-12-01 14:23:49.000000', '2025-12-01 14:23:49.000000', NULL, b'1', b'0', 'SEMESTER_2', 'Web Portfolio (eProject)', NULL, 'd9dd9903-fa60-4bb8-a3b0-efd15d767962', '072dbc3e-5b95-4c20-8c52-00903c3a4178'),
('c20d8aed-5dd4-49a7-a1bd-e3727edebc47', '2025-12-01 14:23:37.000000', '2025-12-01 14:23:37.000000', NULL, b'1', b'0', 'SEMESTER_3', 'Application Development Using Flutter and Dart', NULL, NULL, 'ee744a66-5d47-4322-97a0-bf5bbfea4db3'),
('c4d91b79-ad63-464d-a424-f613da71e94a', '2025-12-01 14:23:53.000000', '2025-12-01 14:23:53.000000', NULL, b'1', b'0', 'SEMESTER_1', 'Security Architecture and Hacking', NULL, 'e36b06a4-d2fb-4030-83bb-40226191f9a5', '3dc6391c-04e0-476d-b84d-4611d853ae41'),
('c9dfb0f3-d475-484c-9ad3-0a4a0e762505', '2025-12-01 14:23:49.000000', '2025-12-01 14:23:49.000000', NULL, b'1', b'0', 'SEMESTER_3', 'Game Idea and Visualization', NULL, 'e044b442-adc9-4a4f-830b-bf94cbe404d1', '072dbc3e-5b95-4c20-8c52-00903c3a4178'),
('cbcf1715-d54e-482b-ada7-7a9117f856f2', '2025-12-01 14:23:49.000000', '2025-12-01 14:23:49.000000', NULL, b'1', b'0', 'SEMESTER_4', 'Modeling 3D Objects with Maya', NULL, '9af3a2d2-db08-4fb2-84ce-59eb68f6a7a1', '072dbc3e-5b95-4c20-8c52-00903c3a4178'),
('cc0de111-1527-41fd-8a45-f8e7a6f481c3', '2025-12-01 14:23:49.000000', '2025-12-01 14:23:49.000000', NULL, b'1', b'0', 'SEMESTER_2', 'Building Next Generation Websites', NULL, '0a3dc4ab-5cc3-4de4-8e09-b9bcb7b4aff7', '072dbc3e-5b95-4c20-8c52-00903c3a4178'),
('ceb480a7-c01d-446d-b045-993ea3df935d', '2025-12-01 14:23:49.000000', '2025-12-01 14:23:49.000000', NULL, b'1', b'0', 'SEMESTER_2', 'Bootstrap', NULL, '1265f283-6b1d-46a4-a75a-7a74614fe3a7', '072dbc3e-5b95-4c20-8c52-00903c3a4178'),
('d193dd54-7bc7-4a3d-a533-0cdb512d7f96', '2025-12-01 14:23:29.000000', '2025-12-01 14:23:29.000000', NULL, b'1', b'0', 'SEMESTER_1', 'Data handling using T-SQL', NULL, 'cb41ef50-b00c-4ca4-9d89-04d618be153b', 'fd994a46-3e46-40fd-bbc4-563641cc928a'),
('d5fe01e7-8c01-4700-8241-a436f3a2f113', '2025-12-01 14:23:37.000000', '2025-12-01 14:23:37.000000', NULL, b'1', b'0', 'SEMESTER_4', 'Modern Web Components with Jakarta EE', NULL, NULL, 'ee744a66-5d47-4322-97a0-bf5bbfea4db3'),
('d923ffb9-e8be-403d-9345-91ef9c3817e3', '2025-12-01 14:23:49.000000', '2025-12-01 14:23:49.000000', NULL, b'1', b'0', 'SEMESTER_3', 'Editing Digital Video', NULL, 'e7115014-71f3-43dc-ad4e-157212a9e2d8', '072dbc3e-5b95-4c20-8c52-00903c3a4178'),
('de8fbd9a-144e-45df-a99e-fc3f973fda1e', '2025-12-01 14:23:37.000000', '2025-12-01 14:23:37.000000', NULL, b'1', b'0', 'SEMESTER_3', 'Powerful and Rich Applications with Microsoft Azure', NULL, NULL, 'ee744a66-5d47-4322-97a0-bf5bbfea4db3'),
('e5d08036-1fea-4b16-ae52-bdff1a978d79', '2025-12-01 14:23:29.000000', '2025-12-01 14:23:29.000000', NULL, b'1', b'0', 'SEMESTER_1', 'Data Analysis with MS Excel', NULL, '301000c3-babc-46da-8875-00ed19625995', 'fd994a46-3e46-40fd-bbc4-563641cc928a'),
('e6d01da9-4553-4de2-87a2-42d767839e18', '2025-12-01 14:23:33.000000', '2025-12-01 14:23:33.000000', NULL, b'1', b'0', 'SEMESTER_3', 'Developing Microsoft Azure Solutions', NULL, '6eaadacb-61eb-45b0-8e18-140ce92da395', '3abe3528-a24e-4265-9aec-36f6d1c598fd'),
('e7db34ce-f599-4524-904c-061d97f83536', '2025-12-01 14:23:33.000000', '2025-12-01 14:23:33.000000', NULL, b'1', b'0', 'SEMESTER_2', 'Project-Java Application Developmemt', NULL, 'f2ff7af7-849f-4854-ae34-0f6fff4acf70', '3abe3528-a24e-4265-9aec-36f6d1c598fd'),
('e89764c1-cb6d-4cc7-8b5f-8f3a8052539b', '2025-12-01 14:23:33.000000', '2025-12-01 14:23:33.000000', NULL, b'1', b'0', 'SEMESTER_4', 'Application Development Using Flutter and Dart', NULL, '4ff8f13e-3501-404a-aba4-01e92bf12647', '3abe3528-a24e-4265-9aec-36f6d1c598fd'),
('eac7250b-1527-4a83-82b0-8013bb9fc609', '2025-12-01 14:23:37.000000', '2025-12-01 14:23:37.000000', NULL, b'1', b'0', 'SEMESTER_3', 'ASP.NET Core MVC-The Framework for Future Web\nInnovations', NULL, NULL, 'ee744a66-5d47-4322-97a0-bf5bbfea4db3'),
('eacd3df2-5548-4be8-844f-3269942be636', '2025-12-01 14:23:49.000000', '2025-12-01 14:23:49.000000', NULL, b'1', b'0', 'SEMESTER_1', 'Concepts of Graphics and Illustrations', NULL, '854ad2f4-424b-439a-bbfe-a68e7f9c1512', '072dbc3e-5b95-4c20-8c52-00903c3a4178'),
('ebf421f4-6cee-4921-8302-c2ab22c36f94', '2025-12-01 14:23:37.000000', '2025-12-01 14:23:37.000000', NULL, b'1', b'0', 'SEMESTER_2', 'Server-side Development with NodeJS', NULL, '2d11f193-8c8c-4558-b616-266363778980', 'ee744a66-5d47-4322-97a0-bf5bbfea4db3'),
('ee0d0571-171f-4c8b-99f3-88b1121f43e3', '2025-12-01 14:23:53.000000', '2025-12-01 14:23:53.000000', NULL, b'1', b'0', 'SEMESTER_1', 'Introduction to Cyber Crime Investigation', NULL, '7ed4f9d2-f108-478b-89a8-432eb3a60689', '3dc6391c-04e0-476d-b84d-4611d853ae41'),
('efe4e290-b5c8-4897-b2c5-c3c639e1a73f', '2025-12-01 14:23:53.000000', '2025-12-01 14:23:53.000000', NULL, b'1', b'0', 'SEMESTER_1', 'Advanced Ethical Hacking', NULL, '42fe67a0-515a-4118-801c-7414b7e3b254', '3dc6391c-04e0-476d-b84d-4611d853ae41'),
('f7f68c19-271a-4ccf-9ec0-c9eaefa352d3', '2025-12-01 14:23:49.000000', '2025-12-01 14:23:49.000000', NULL, b'1', b'0', 'SEMESTER_3', 'Game Asset Modeling', NULL, 'fd8b902c-e4b0-4ef1-b508-16b492f5afe3', '072dbc3e-5b95-4c20-8c52-00903c3a4178'),
('f9063663-252b-4e68-b790-7d7590dd045d', '2025-12-01 14:23:37.000000', '2025-12-01 14:23:37.000000', NULL, b'1', b'0', 'SEMESTER_4', 'Internship', NULL, NULL, 'ee744a66-5d47-4322-97a0-bf5bbfea4db3'),
('fcd01551-3b50-474a-ab52-a25f9f979d9b', '2025-12-01 14:23:37.000000', '2025-12-01 14:23:37.000000', NULL, b'1', b'0', 'SEMESTER_4', 'Project-Robust Java Applications for Enterprises', NULL, NULL, 'ee744a66-5d47-4322-97a0-bf5bbfea4db3'),
('fe8c5790-5b31-49ec-9652-a961f4843c09', '2025-12-01 14:23:33.000000', '2025-12-01 14:23:33.000000', NULL, b'1', b'0', 'SEMESTER_2', 'Programming in C#', NULL, 'd5dd7f34-5754-4ba3-8d84-b050e5edcdd8', '3abe3528-a24e-4265-9aec-36f6d1c598fd');

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
  `reason_for_carry_over2` text DEFAULT NULL,
  `status` enum('REGISTERED','COMPLETED','NOT_COMPLETED','CARRYOVER') NOT NULL,
  `teacher_notes` text DEFAULT NULL,
  `year` int(11) NOT NULL,
  `subject_id` varchar(255) NOT NULL,
  `teacher_id` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `subject_systems`
--

CREATE TABLE `subject_systems` (
  `id` varchar(255) NOT NULL,
  `creation_timestamp` datetime(6) DEFAULT NULL,
  `update_timestamp` datetime(6) DEFAULT NULL,
  `is_active` bit(1) NOT NULL,
  `system_code` varchar(30) NOT NULL,
  `system_name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `subject_systems`
--

INSERT INTO `subject_systems` (`id`, `creation_timestamp`, `update_timestamp`, `is_active`, `system_code`, `system_name`) VALUES
('072dbc3e-5b95-4c20-8c52-00903c3a4178', '2025-12-01 14:18:29.000000', '2025-12-01 14:18:29.000000', b'1', 'Skill Arena OV 6899', 'Skill Arena OV 6899'),
('3abe3528-a24e-4265-9aec-36f6d1c598fd', '2025-12-01 14:19:07.000000', '2025-12-01 14:19:07.000000', b'1', 'Skill Aptech OV 7191', 'Skill Aptech OV 7191'),
('3dc6391c-04e0-476d-b84d-4611d853ae41', '2025-12-01 14:21:25.000000', '2025-12-01 14:21:25.000000', b'1', 'Skill Network OV 6680', 'Skill Network OV 6680'),
('ee744a66-5d47-4322-97a0-bf5bbfea4db3', '2025-12-01 14:18:08.000000', '2025-12-01 14:18:08.000000', b'1', 'Skill Aptech OV 7195', 'Skill Aptech OV 7195'),
('fd994a46-3e46-40fd-bbc4-563641cc928a', '2025-12-01 14:18:21.000000', '2025-12-01 14:18:21.000000', b'1', 'ACN Pro OV 7096', 'ACN Pro OV 7096');

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
('0242276c-d76e-4158-916e-f9ed61729a44', '2025-12-01 14:23:37.000000', '2025-12-01 14:23:37.000000', NULL, b'1', NULL, 'SEMESTER_3', 'eac7250b-1527-4a83-82b0-8013bb9fc609', 'ee744a66-5d47-4322-97a0-bf5bbfea4db3'),
('03fefbc0-01ed-4898-b95b-7eb3baf4a47d', '2025-12-01 14:23:49.000000', '2025-12-01 14:23:49.000000', NULL, b'1', NULL, 'SEMESTER_1', '43e6d043-4e56-4ae8-a0b6-6bd6b9e4e1d1', '072dbc3e-5b95-4c20-8c52-00903c3a4178'),
('057d89ad-af04-4e73-af14-0a907c3d15cd', '2025-12-01 14:23:29.000000', '2025-12-01 14:23:29.000000', NULL, b'1', NULL, 'SEMESTER_1', '01cca446-63fa-4e6b-975d-532afad151a5', 'fd994a46-3e46-40fd-bbc4-563641cc928a'),
('139537da-51a4-48c0-9709-8657530130d8', '2025-12-01 14:23:33.000000', '2025-12-01 14:23:33.000000', NULL, b'1', NULL, 'SEMESTER_4', '7552ccde-52fa-4d85-b307-515257501cfb', '3abe3528-a24e-4265-9aec-36f6d1c598fd'),
('13b01ccf-5bd4-4891-ab96-e928807d68cf', '2025-12-01 14:23:50.000000', '2025-12-01 14:23:50.000000', NULL, b'1', NULL, 'SEMESTER_4', 'b8daa808-2a5d-4224-8157-de1422e11987', '072dbc3e-5b95-4c20-8c52-00903c3a4178'),
('13e31018-a6e1-4404-928a-66d2306cc9ba', '2025-12-01 14:23:32.000000', '2025-12-01 14:23:32.000000', NULL, b'1', NULL, 'SEMESTER_1', '8677c221-9d38-41ac-bf62-6a043b54cbe8', '3abe3528-a24e-4265-9aec-36f6d1c598fd'),
('140dd684-7e2c-44f7-bd73-d2ec8a9ef66d', '2025-12-01 14:23:37.000000', '2025-12-01 14:23:37.000000', NULL, b'1', NULL, 'SEMESTER_1', '3a1b8c22-4d4b-4cec-96a7-80bbaa8af4e0', 'ee744a66-5d47-4322-97a0-bf5bbfea4db3'),
('14e66ae5-f77a-45b3-b253-f6f3a17e9778', '2025-12-01 14:23:29.000000', '2025-12-01 14:23:29.000000', NULL, b'1', NULL, 'SEMESTER_1', '8a0bc5e0-0687-49dd-9ea2-59b8e225475c', 'fd994a46-3e46-40fd-bbc4-563641cc928a'),
('1a04fc8e-dc05-4718-a0cc-cdb68e060bfb', '2025-12-01 14:23:33.000000', '2025-12-01 14:23:33.000000', NULL, b'1', NULL, 'SEMESTER_2', '5764bd5f-aa39-4872-a91d-18fcabb6f28f', '3abe3528-a24e-4265-9aec-36f6d1c598fd'),
('1b5354d6-636b-4179-b131-dfd99f11a889', '2025-12-01 14:23:33.000000', '2025-12-01 14:23:33.000000', NULL, b'1', NULL, 'SEMESTER_1', 'b2fdf942-5d91-4841-9d96-ee648be09c91', '3abe3528-a24e-4265-9aec-36f6d1c598fd'),
('1d43ac50-8c4f-4404-86d8-8f3374e9a0f9', '2025-12-01 14:23:33.000000', '2025-12-01 14:23:33.000000', NULL, b'1', NULL, 'SEMESTER_1', '517bbe4d-0da2-485a-a53f-159ff62e9b2d', '3abe3528-a24e-4265-9aec-36f6d1c598fd'),
('1d91fea7-4367-483e-b3dd-dc774d2996d2', '2025-12-01 14:23:50.000000', '2025-12-01 14:23:50.000000', NULL, b'1', NULL, 'SEMESTER_4', '3613b492-979d-43ad-8713-56e6f2fb291a', '072dbc3e-5b95-4c20-8c52-00903c3a4178'),
('1df31981-54a5-4f2d-9d3b-ca6fc59f0b83', '2025-12-01 14:23:37.000000', '2025-12-01 14:23:37.000000', NULL, b'1', NULL, 'SEMESTER_3', 'c20d8aed-5dd4-49a7-a1bd-e3727edebc47', 'ee744a66-5d47-4322-97a0-bf5bbfea4db3'),
('1fec3139-2aee-4f45-9616-decf444aea9b', '2025-12-01 14:23:49.000000', '2025-12-01 14:23:49.000000', NULL, b'1', NULL, 'SEMESTER_1', 'a8a6bca5-c109-4556-8c37-549f10687544', '072dbc3e-5b95-4c20-8c52-00903c3a4178'),
('203f1fdf-3fee-4cc1-b191-4d3c805680ea', '2025-12-01 14:23:49.000000', '2025-12-01 14:23:49.000000', NULL, b'1', NULL, 'SEMESTER_2', 'cc0de111-1527-41fd-8a45-f8e7a6f481c3', '072dbc3e-5b95-4c20-8c52-00903c3a4178'),
('24b21280-a846-403a-92c6-4cff86edf4ac', '2025-12-01 14:23:49.000000', '2025-12-01 14:23:49.000000', NULL, b'1', NULL, 'SEMESTER_1', '68ca3724-604f-4f17-9831-9e78e92cb8fa', '072dbc3e-5b95-4c20-8c52-00903c3a4178'),
('24ef22b9-ecb0-44d9-beb7-300e5d4cad5a', '2025-12-01 14:23:49.000000', '2025-12-01 14:23:49.000000', NULL, b'1', NULL, 'SEMESTER_3', '1504207e-4898-43d6-8b01-a4db5a626fca', '072dbc3e-5b95-4c20-8c52-00903c3a4178'),
('2892eb0d-8123-47aa-9699-a15a04822522', '2025-12-01 14:23:33.000000', '2025-12-01 14:23:33.000000', NULL, b'1', NULL, 'SEMESTER_4', '2d9d2a83-f16e-4dbe-9f6f-076f73a1ffe3', '3abe3528-a24e-4265-9aec-36f6d1c598fd'),
('28aed39c-1c8b-424e-93ef-2fb23fe89358', '2025-12-01 14:23:37.000000', '2025-12-01 14:23:37.000000', NULL, b'1', NULL, 'SEMESTER_4', 'd5fe01e7-8c01-4700-8241-a436f3a2f113', 'ee744a66-5d47-4322-97a0-bf5bbfea4db3'),
('29e83942-6182-40de-8022-e5827ad79bb3', '2025-12-01 14:23:33.000000', '2025-12-01 14:23:33.000000', NULL, b'1', NULL, 'SEMESTER_2', 'fe8c5790-5b31-49ec-9652-a961f4843c09', '3abe3528-a24e-4265-9aec-36f6d1c598fd'),
('2be0b960-87cd-4255-bfb9-9429ddb858f9', '2025-12-01 14:23:49.000000', '2025-12-01 14:23:49.000000', NULL, b'1', NULL, 'SEMESTER_2', '871f8b2f-1cf4-4851-ae5e-6d309b350d6f', '072dbc3e-5b95-4c20-8c52-00903c3a4178'),
('2eebc731-0f37-4a06-ac9a-75331fe28dfa', '2025-12-01 14:23:37.000000', '2025-12-01 14:23:37.000000', NULL, b'1', NULL, 'SEMESTER_4', '1a40959f-c63f-4cca-b093-5925ca4c8fa1', 'ee744a66-5d47-4322-97a0-bf5bbfea4db3'),
('315e093b-59e9-420b-814f-df1a81e4a9a3', '2025-12-01 14:23:37.000000', '2025-12-01 14:23:37.000000', NULL, b'1', NULL, 'SEMESTER_2', '1ae91ef3-fef2-41de-a5e1-77d7695a7112', 'ee744a66-5d47-4322-97a0-bf5bbfea4db3'),
('31996284-e960-43c2-8f8c-d0185296cb77', '2025-12-01 14:23:37.000000', '2025-12-01 14:23:37.000000', NULL, b'1', NULL, 'SEMESTER_2', '59ac37d1-f8a6-4180-b5bb-91e6b0dedafa', 'ee744a66-5d47-4322-97a0-bf5bbfea4db3'),
('3a4c3f28-b82f-4d68-81e5-153ab0220039', '2025-12-01 14:23:37.000000', '2025-12-01 14:23:37.000000', NULL, b'1', NULL, 'SEMESTER_4', '339d7af6-e91a-487f-9030-e953b5e2fcad', 'ee744a66-5d47-4322-97a0-bf5bbfea4db3'),
('3c3a9ac9-2f4c-4829-bf2c-8b6ec07d4a38', '2025-12-01 14:23:33.000000', '2025-12-01 14:23:33.000000', NULL, b'1', NULL, 'SEMESTER_3', '1f266c8d-113a-4aa3-92a8-1b1e9f91e5ad', '3abe3528-a24e-4265-9aec-36f6d1c598fd'),
('3d780619-0933-4ab2-add0-b8cfb4b8d9ad', '2025-12-01 14:23:49.000000', '2025-12-01 14:23:49.000000', NULL, b'1', NULL, 'SEMESTER_3', '28284805-09ee-496e-ad17-f9fae3777772', '072dbc3e-5b95-4c20-8c52-00903c3a4178'),
('3d7e2276-6a19-42b8-97ce-4d7b29066486', '2025-12-01 14:23:49.000000', '2025-12-01 14:23:49.000000', NULL, b'1', NULL, 'SEMESTER_3', 'f7f68c19-271a-4ccf-9ec0-c9eaefa352d3', '072dbc3e-5b95-4c20-8c52-00903c3a4178'),
('3f34cfb7-14a3-4284-921b-70772d277908', '2025-12-01 14:23:49.000000', '2025-12-01 14:23:49.000000', NULL, b'1', NULL, 'SEMESTER_1', '11a72044-e575-48d8-b46f-8843b2994e1d', '072dbc3e-5b95-4c20-8c52-00903c3a4178'),
('3fb077cc-3dbe-488f-9b5e-0cd9f76b15a7', '2025-12-01 14:23:49.000000', '2025-12-01 14:23:49.000000', NULL, b'1', NULL, 'SEMESTER_3', '2c7ac604-5672-4143-bc22-90cb16f9cf23', '072dbc3e-5b95-4c20-8c52-00903c3a4178'),
('427e3e9d-b8a4-432a-a776-34a685353a6a', '2025-12-01 14:23:49.000000', '2025-12-01 14:23:49.000000', NULL, b'1', NULL, 'SEMESTER_4', '1413d21b-1d17-4ad3-abdf-43e8c3c3de29', '072dbc3e-5b95-4c20-8c52-00903c3a4178'),
('42b08a08-ec28-4dbb-a935-2913076e0371', '2025-12-01 14:23:49.000000', '2025-12-01 14:23:49.000000', NULL, b'1', NULL, 'SEMESTER_3', '5272bc22-bc4b-4d5f-b1b5-b2879f40f39f', '072dbc3e-5b95-4c20-8c52-00903c3a4178'),
('4419bc4b-3565-4a91-a8a2-4db4f521057c', '2025-12-01 14:23:49.000000', '2025-12-01 14:23:49.000000', NULL, b'1', NULL, 'SEMESTER_2', '7812d516-1a91-4172-b43a-cf8f9fa6ce17', '072dbc3e-5b95-4c20-8c52-00903c3a4178'),
('488b2dec-e3e0-4dcb-959b-326d1cb12974', '2025-12-01 14:23:53.000000', '2025-12-01 14:23:53.000000', NULL, b'1', NULL, 'SEMESTER_1', '7876c256-566b-488d-afb1-f4fbf088a175', '3dc6391c-04e0-476d-b84d-4611d853ae41'),
('4e51d9ef-c8f2-4684-9875-e6afa951b57c', '2025-12-01 14:23:33.000000', '2025-12-01 14:23:33.000000', NULL, b'1', NULL, 'SEMESTER_2', '511ea932-3b9e-4942-bab6-82f09b496ccf', '3abe3528-a24e-4265-9aec-36f6d1c598fd'),
('4ea35fac-8066-417a-ad5a-626b5eb75e9c', '2025-12-01 14:23:37.000000', '2025-12-01 14:23:37.000000', NULL, b'1', NULL, 'SEMESTER_4', '9a87eaa8-160b-4192-b082-dfecad226e51', 'ee744a66-5d47-4322-97a0-bf5bbfea4db3'),
('4ed18e8a-b744-445d-9af4-f1d0a04b39f9', '2025-12-01 14:23:49.000000', '2025-12-01 14:23:49.000000', NULL, b'1', NULL, 'SEMESTER_1', 'abf39662-ea4a-4b8d-a7db-ce52bcb5da3e', '072dbc3e-5b95-4c20-8c52-00903c3a4178'),
('556e1479-8202-497c-87eb-3437524e6eb5', '2025-12-01 14:23:50.000000', '2025-12-01 14:23:50.000000', NULL, b'1', NULL, 'SEMESTER_4', '785800ec-0e4e-4374-a1b9-3fffc59d25a9', '072dbc3e-5b95-4c20-8c52-00903c3a4178'),
('56a0b68c-8d46-4f28-9941-ef74a75778e3', '2025-12-01 14:23:37.000000', '2025-12-01 14:23:37.000000', NULL, b'1', NULL, 'SEMESTER_1', '245a31a8-b139-4358-819d-f8193d4e2c30', 'ee744a66-5d47-4322-97a0-bf5bbfea4db3'),
('56da03da-8167-457f-8009-a8997d9e4ae5', '2025-12-01 14:23:53.000000', '2025-12-01 14:23:53.000000', NULL, b'1', NULL, 'SEMESTER_1', 'c4d91b79-ad63-464d-a424-f613da71e94a', '3dc6391c-04e0-476d-b84d-4611d853ae41'),
('582aafb6-1e26-406d-82ea-97db8df22fba', '2025-12-01 14:23:49.000000', '2025-12-01 14:23:49.000000', NULL, b'1', NULL, 'SEMESTER_2', '1ab307c2-f6f9-4d93-a72a-aa91962e5067', '072dbc3e-5b95-4c20-8c52-00903c3a4178'),
('5ae3b555-58e5-4a63-8d9c-113839af409b', '2025-12-01 14:23:49.000000', '2025-12-01 14:23:49.000000', NULL, b'1', NULL, 'SEMESTER_2', '2a46059c-7bde-4abd-85b3-f0fa912cb469', '072dbc3e-5b95-4c20-8c52-00903c3a4178'),
('5d0a1f1c-49be-47f9-a68c-5d1888b19e7a', '2025-12-01 14:23:49.000000', '2025-12-01 14:23:49.000000', NULL, b'1', NULL, 'SEMESTER_3', 'd923ffb9-e8be-403d-9345-91ef9c3817e3', '072dbc3e-5b95-4c20-8c52-00903c3a4178'),
('5d37119d-276d-49d8-b4c6-e14579cc1cdb', '2025-12-01 14:23:37.000000', '2025-12-01 14:23:37.000000', NULL, b'1', NULL, 'SEMESTER_2', '9f9e3fc8-9637-4d54-bdee-4d3b739ec1a9', 'ee744a66-5d47-4322-97a0-bf5bbfea4db3'),
('6232f37f-927a-479c-8172-2b1e5aa0d281', '2025-12-01 14:23:37.000000', '2025-12-01 14:23:37.000000', NULL, b'1', NULL, 'SEMESTER_1', '9deaf4c7-9df0-4a6b-9edb-2c810158ef16', 'ee744a66-5d47-4322-97a0-bf5bbfea4db3'),
('630da7e3-17a0-495d-a6c1-36d23c9bcaf3', '2025-12-01 14:23:29.000000', '2025-12-01 14:23:29.000000', NULL, b'1', NULL, 'SEMESTER_1', '5ee0e883-91d9-4565-8f2e-43053c9af8f9', 'fd994a46-3e46-40fd-bbc4-563641cc928a'),
('667bd893-5672-4b74-818a-00d43ce981e5', '2025-12-01 14:23:37.000000', '2025-12-01 14:23:37.000000', NULL, b'1', NULL, 'SEMESTER_4', '8f057b7a-93b2-43a1-9bee-6e335ef032f6', 'ee744a66-5d47-4322-97a0-bf5bbfea4db3'),
('66e2cbef-7933-495c-88bf-7255fd84b481', '2025-12-01 14:23:53.000000', '2025-12-01 14:23:53.000000', NULL, b'1', NULL, 'SEMESTER_1', 'b173fdef-9106-4da5-ad68-0ac0424a0c55', '3dc6391c-04e0-476d-b84d-4611d853ae41'),
('697d970f-2357-4310-ae42-da1872124bbb', '2025-12-01 14:23:37.000000', '2025-12-01 14:23:37.000000', NULL, b'1', NULL, 'SEMESTER_1', 'b9766ba0-7eff-46d8-9066-af64997b170b', 'ee744a66-5d47-4322-97a0-bf5bbfea4db3'),
('69f9e227-0bf3-4fc7-8c70-fcb0528a0f44', '2025-12-01 14:23:49.000000', '2025-12-01 14:23:49.000000', NULL, b'1', NULL, 'SEMESTER_2', 'ceb480a7-c01d-446d-b045-993ea3df935d', '072dbc3e-5b95-4c20-8c52-00903c3a4178'),
('6b9d3a75-53f3-4eeb-a554-28e24d49d46e', '2025-12-01 14:23:49.000000', '2025-12-01 14:23:49.000000', NULL, b'1', NULL, 'SEMESTER_2', 'c0e29462-4dc3-4ebe-a838-2c81094b99d9', '072dbc3e-5b95-4c20-8c52-00903c3a4178'),
('6c253bea-703c-4aff-842e-ee4aab1d6a6d', '2025-12-01 14:23:33.000000', '2025-12-01 14:23:33.000000', NULL, b'1', NULL, 'SEMESTER_3', '570a730a-6af9-4a83-bb7c-91c09f317b7d', '3abe3528-a24e-4265-9aec-36f6d1c598fd'),
('6e1a421c-24fc-4308-9956-9380b2d83fcb', '2025-12-01 14:23:33.000000', '2025-12-01 14:23:33.000000', NULL, b'1', NULL, 'SEMESTER_4', '72477199-6a22-4eb4-a973-873dc6f330d2', '3abe3528-a24e-4265-9aec-36f6d1c598fd'),
('6fe54110-3a5e-4683-8269-37d8f4da2872', '2025-12-01 14:23:53.000000', '2025-12-01 14:23:53.000000', NULL, b'1', NULL, 'SEMESTER_1', '54853141-c48f-4b3e-baf4-8d0da6b36ae0', '3dc6391c-04e0-476d-b84d-4611d853ae41'),
('7174c9ba-ca3a-48a2-b76c-6cc5e6eddc7d', '2025-12-01 14:23:49.000000', '2025-12-01 14:23:49.000000', NULL, b'1', NULL, 'SEMESTER_1', 'eacd3df2-5548-4be8-844f-3269942be636', '072dbc3e-5b95-4c20-8c52-00903c3a4178'),
('7d375f80-7671-48b2-b64d-ffa95aa14e96', '2025-12-01 14:23:49.000000', '2025-12-01 14:23:49.000000', NULL, b'1', NULL, 'SEMESTER_1', '1dd9a509-65af-44ab-b4e8-9923204c2a83', '072dbc3e-5b95-4c20-8c52-00903c3a4178'),
('7d5c89ba-5bc8-449f-994c-e657ca6317f5', '2025-12-01 14:23:33.000000', '2025-12-01 14:23:33.000000', NULL, b'1', NULL, 'SEMESTER_1', '0b307945-0389-4ad1-a7d5-409b256ccdd0', '3abe3528-a24e-4265-9aec-36f6d1c598fd'),
('7da2ef13-dcad-46a9-8609-6ddb99a486cc', '2025-12-01 14:23:33.000000', '2025-12-01 14:23:33.000000', NULL, b'1', NULL, 'SEMESTER_1', '5ad58bfb-3142-4ff9-8753-21b24ffa06d8', '3abe3528-a24e-4265-9aec-36f6d1c598fd'),
('7e36cb67-f67d-4fef-b9ce-a61f4c9144be', '2025-12-01 14:23:37.000000', '2025-12-01 14:23:37.000000', NULL, b'1', NULL, 'SEMESTER_3', '72251834-2240-4b35-ad99-963a73342293', 'ee744a66-5d47-4322-97a0-bf5bbfea4db3'),
('81a0e92c-e292-4e9a-bd69-0c489a685cc5', '2025-12-01 14:23:53.000000', '2025-12-01 14:23:53.000000', NULL, b'1', NULL, 'SEMESTER_1', '779fd5c1-e50f-42b4-9496-8f7753f1e2e3', '3dc6391c-04e0-476d-b84d-4611d853ae41'),
('87159534-41b4-4eda-9e6f-c9b88580efdb', '2025-12-01 14:23:37.000000', '2025-12-01 14:23:37.000000', NULL, b'1', NULL, 'SEMESTER_4', 'fcd01551-3b50-474a-ab52-a25f9f979d9b', 'ee744a66-5d47-4322-97a0-bf5bbfea4db3'),
('8770071e-c6d1-4d36-a650-3be2eec33433', '2025-12-01 14:23:53.000000', '2025-12-01 14:23:53.000000', NULL, b'1', NULL, 'SEMESTER_1', 'ee0d0571-171f-4c8b-99f3-88b1121f43e3', '3dc6391c-04e0-476d-b84d-4611d853ae41'),
('89ccb5dd-9d51-4b43-86a4-bb0445bc8de4', '2025-12-01 14:23:33.000000', '2025-12-01 14:23:33.000000', NULL, b'1', NULL, 'SEMESTER_4', '6f51682d-7fce-44c8-b926-7e0fcbdcdf35', '3abe3528-a24e-4265-9aec-36f6d1c598fd'),
('8c3ec5e0-9318-4ccb-a863-0bdce1652313', '2025-12-01 14:23:37.000000', '2025-12-01 14:23:37.000000', NULL, b'1', NULL, 'SEMESTER_2', 'ebf421f4-6cee-4921-8302-c2ab22c36f94', 'ee744a66-5d47-4322-97a0-bf5bbfea4db3'),
('8cfcf0f5-b523-4ae3-b164-9a17c3093b76', '2025-12-01 14:23:37.000000', '2025-12-01 14:23:37.000000', NULL, b'1', NULL, 'SEMESTER_1', 'c0640e4b-9359-4177-8c09-e373733a05c0', 'ee744a66-5d47-4322-97a0-bf5bbfea4db3'),
('90e8d24f-6eb6-4a4b-8901-da32ec0b956d', '2025-12-01 14:23:53.000000', '2025-12-01 14:23:53.000000', NULL, b'1', NULL, 'SEMESTER_1', '19bae402-b205-4e21-9cd4-c89cca5d4f25', '3dc6391c-04e0-476d-b84d-4611d853ae41'),
('9525614a-9923-47bf-a933-a24c26ccd989', '2025-12-01 14:23:33.000000', '2025-12-01 14:23:33.000000', NULL, b'1', NULL, 'SEMESTER_3', '6a20e2ac-1d2b-4f5d-9d49-f3ef64042b0d', '3abe3528-a24e-4265-9aec-36f6d1c598fd'),
('9614bafa-5c12-455a-bb7b-d5cfc83cbd82', '2025-12-01 14:23:33.000000', '2025-12-01 14:23:33.000000', NULL, b'1', NULL, 'SEMESTER_3', 'a6c02e4b-2ec3-4106-949f-4c5813e04d74', '3abe3528-a24e-4265-9aec-36f6d1c598fd'),
('988edb47-3dda-487f-b04f-54fd7fbea95a', '2025-12-01 14:23:37.000000', '2025-12-01 14:23:37.000000', NULL, b'1', NULL, 'SEMESTER_3', '1368f354-62c3-4b18-8704-b54eded58dd9', 'ee744a66-5d47-4322-97a0-bf5bbfea4db3'),
('a5117c7d-229d-4b6c-87f2-851c5464467a', '2025-12-01 14:23:33.000000', '2025-12-01 14:23:33.000000', NULL, b'1', NULL, 'SEMESTER_3', '12f9536d-af19-4b64-95ab-20f812567c92', '3abe3528-a24e-4265-9aec-36f6d1c598fd'),
('a9814b31-e405-42e0-ab1f-45576570c355', '2025-12-01 14:23:29.000000', '2025-12-01 14:23:29.000000', NULL, b'1', NULL, 'SEMESTER_1', '441aa2e5-0e63-442c-99e5-281f653a1d77', 'fd994a46-3e46-40fd-bbc4-563641cc928a'),
('afe12ad0-a283-49a8-ae77-69b65ce0e047', '2025-12-01 14:23:33.000000', '2025-12-01 14:23:33.000000', NULL, b'1', NULL, 'SEMESTER_4', '54afd0ac-3fc4-49f8-86aa-cf03d9af571d', '3abe3528-a24e-4265-9aec-36f6d1c598fd'),
('b16f2eb6-b968-47ad-882c-a7bf237c88d2', '2025-12-01 14:23:32.000000', '2025-12-01 14:23:32.000000', NULL, b'1', NULL, 'SEMESTER_1', 'b933e703-0ebf-4c74-b668-efaa23afcd07', '3abe3528-a24e-4265-9aec-36f6d1c598fd'),
('b2f2c20e-922a-4d39-b2fe-6c2d4f813a4b', '2025-12-01 14:23:37.000000', '2025-12-01 14:23:37.000000', NULL, b'1', NULL, 'SEMESTER_2', '6fa94e22-7d9c-4402-ace2-2fca18976574', 'ee744a66-5d47-4322-97a0-bf5bbfea4db3'),
('bc91643f-ff33-40d9-8fd7-8c6a0fb33232', '2025-12-01 14:23:53.000000', '2025-12-01 14:23:53.000000', NULL, b'1', NULL, 'SEMESTER_1', '5bb5451f-9714-4c7f-8d2f-5c7c8b97044a', '3dc6391c-04e0-476d-b84d-4611d853ae41'),
('bcbdd700-efa1-4268-83ee-f8620fa88fc9', '2025-12-01 14:23:50.000000', '2025-12-01 14:23:50.000000', NULL, b'1', NULL, 'SEMESTER_4', '1e449c30-cbf6-4628-a9ed-25878d9027a0', '072dbc3e-5b95-4c20-8c52-00903c3a4178'),
('bf293655-3436-4a91-bd8e-cc58d749b991', '2025-12-01 14:23:37.000000', '2025-12-01 14:23:37.000000', NULL, b'1', NULL, 'SEMESTER_2', '10da5c8a-f019-4673-9128-efd3405acd52', 'ee744a66-5d47-4322-97a0-bf5bbfea4db3'),
('c1f4b9f0-8fb8-4882-a214-a915f4d945d3', '2025-12-01 14:23:49.000000', '2025-12-01 14:23:49.000000', NULL, b'1', NULL, 'SEMESTER_3', 'c9dfb0f3-d475-484c-9ad3-0a4a0e762505', '072dbc3e-5b95-4c20-8c52-00903c3a4178'),
('c920574f-8371-414a-9bd9-fc0f830d3b33', '2025-12-01 14:23:50.000000', '2025-12-01 14:23:50.000000', NULL, b'1', NULL, 'SEMESTER_4', '8e076093-72b5-461d-bfef-b19e543d2c26', '072dbc3e-5b95-4c20-8c52-00903c3a4178'),
('ca727890-8540-4976-9519-70f9c615f4a6', '2025-12-01 14:23:53.000000', '2025-12-01 14:23:53.000000', NULL, b'1', NULL, 'SEMESTER_1', 'efe4e290-b5c8-4897-b2c5-c3c639e1a73f', '3dc6391c-04e0-476d-b84d-4611d853ae41'),
('cadfb0bd-271b-4e43-8d00-42e71fd47475', '2025-12-01 14:23:33.000000', '2025-12-01 14:23:33.000000', NULL, b'1', NULL, 'SEMESTER_2', '2b78e019-ef63-4331-8c98-d691241ce711', '3abe3528-a24e-4265-9aec-36f6d1c598fd'),
('cb54f7e3-ff3b-4b61-aa22-8405fcab107c', '2025-12-01 14:23:49.000000', '2025-12-01 14:23:49.000000', NULL, b'1', NULL, 'SEMESTER_3', '5792cdc7-7f59-4b64-b889-2eeb579d3d23', '072dbc3e-5b95-4c20-8c52-00903c3a4178'),
('ce896cfe-6f6e-4b80-88cc-df797d5fb1cf', '2025-12-01 14:23:49.000000', '2025-12-01 14:23:49.000000', NULL, b'1', NULL, 'SEMESTER_2', '9fcd10d8-ce3a-46d5-b84b-daa09d7d6c07', '072dbc3e-5b95-4c20-8c52-00903c3a4178'),
('cfc08137-98b5-4e05-a9a8-30fb8440a1ba', '2025-12-01 14:23:37.000000', '2025-12-01 14:23:37.000000', NULL, b'1', NULL, 'SEMESTER_3', 'a638dc9c-40a7-46df-b852-d3efd6d4b0f1', 'ee744a66-5d47-4322-97a0-bf5bbfea4db3'),
('d2c038b0-1d1a-485a-bcfb-9f17adce6e44', '2025-12-01 14:23:33.000000', '2025-12-01 14:23:33.000000', NULL, b'1', NULL, 'SEMESTER_2', 'e7db34ce-f599-4524-904c-061d97f83536', '3abe3528-a24e-4265-9aec-36f6d1c598fd'),
('d2f82351-9cac-4737-ad64-a474c8097431', '2025-12-01 14:23:50.000000', '2025-12-01 14:23:50.000000', NULL, b'1', NULL, 'SEMESTER_4', 'a28501c9-6a1b-458b-b8b0-743ece4bab51', '072dbc3e-5b95-4c20-8c52-00903c3a4178'),
('d40859cd-cb88-4209-8cb0-0f7f29c69b09', '2025-12-01 14:23:33.000000', '2025-12-01 14:23:33.000000', NULL, b'1', NULL, 'SEMESTER_1', '49225e79-f349-41f2-9191-6e9c6859375b', '3abe3528-a24e-4265-9aec-36f6d1c598fd'),
('d4158572-a48f-4c26-b8e6-3e41d9d9d6a4', '2025-12-01 14:23:49.000000', '2025-12-01 14:23:49.000000', NULL, b'1', NULL, 'SEMESTER_1', '546cacac-5ad5-46a5-b7cc-f66c1e05de3a', '072dbc3e-5b95-4c20-8c52-00903c3a4178'),
('d54c5ee1-840b-4472-9285-9a5a87c06777', '2025-12-01 14:23:53.000000', '2025-12-01 14:23:53.000000', NULL, b'1', NULL, 'SEMESTER_1', 'ba3080bf-ae9f-4fcd-8447-df9265c18f33', '3dc6391c-04e0-476d-b84d-4611d853ae41'),
('d5636015-08bc-490d-9421-f7268e818c56', '2025-12-01 14:23:37.000000', '2025-12-01 14:23:37.000000', NULL, b'1', NULL, 'SEMESTER_4', 'f9063663-252b-4e68-b790-7d7590dd045d', 'ee744a66-5d47-4322-97a0-bf5bbfea4db3'),
('d7851ed4-0c91-4887-b98b-3b101686890e', '2025-12-01 14:23:49.000000', '2025-12-01 14:23:49.000000', NULL, b'1', NULL, 'SEMESTER_3', '17115b3b-ed56-4894-a579-7a59381dd3cd', '072dbc3e-5b95-4c20-8c52-00903c3a4178'),
('db745621-6191-4405-9f90-da0bde312e5d', '2025-12-01 14:23:49.000000', '2025-12-01 14:23:49.000000', NULL, b'1', NULL, 'SEMESTER_3', '8fa2ce86-2521-4578-b8b5-4f89f9ab3c31', '072dbc3e-5b95-4c20-8c52-00903c3a4178'),
('dbbd90ed-e9b8-4e7b-acad-64598abfda66', '2025-12-01 14:23:29.000000', '2025-12-01 14:23:29.000000', NULL, b'1', NULL, 'SEMESTER_1', 'be5cf167-eb75-4f7e-a634-8d35a455e6de', 'fd994a46-3e46-40fd-bbc4-563641cc928a'),
('dd36a2a1-36a1-4a1e-b3c5-e11b36e71415', '2025-12-01 14:23:49.000000', '2025-12-01 14:23:49.000000', NULL, b'1', NULL, 'SEMESTER_3', '8e0f97bf-e656-4bf8-ae41-0e9c6e4829bf', '072dbc3e-5b95-4c20-8c52-00903c3a4178'),
('e41a4161-e51b-448b-a041-90bda3643299', '2025-12-01 14:23:37.000000', '2025-12-01 14:23:37.000000', NULL, b'1', NULL, 'SEMESTER_2', '32cf39f1-e33b-4ead-9703-cd1339378ae7', 'ee744a66-5d47-4322-97a0-bf5bbfea4db3'),
('e4993fc0-f412-4df6-bee3-3803e3985617', '2025-12-01 14:23:37.000000', '2025-12-01 14:23:37.000000', NULL, b'1', NULL, 'SEMESTER_4', '6e43ab85-0bc3-4927-8828-bd0a1a85bc4b', 'ee744a66-5d47-4322-97a0-bf5bbfea4db3'),
('e67143cd-c0b9-40b2-be9c-36c4bc8a6c72', '2025-12-01 14:23:53.000000', '2025-12-01 14:23:53.000000', NULL, b'1', NULL, 'SEMESTER_1', '65c8f200-553c-4e19-867c-3d355c351c44', '3dc6391c-04e0-476d-b84d-4611d853ae41'),
('e6723c59-a00d-4948-b192-cd80181ff945', '2025-12-01 14:23:29.000000', '2025-12-01 14:23:29.000000', NULL, b'1', NULL, 'SEMESTER_1', 'd193dd54-7bc7-4a3d-a533-0cdb512d7f96', 'fd994a46-3e46-40fd-bbc4-563641cc928a'),
('e906f559-d48c-421c-8951-6cced08a0a11', '2025-12-01 14:23:29.000000', '2025-12-01 14:23:29.000000', NULL, b'1', NULL, 'SEMESTER_1', 'e5d08036-1fea-4b16-ae52-bdff1a978d79', 'fd994a46-3e46-40fd-bbc4-563641cc928a'),
('ea62b56d-1be5-4080-a475-ff388dd29d9e', '2025-12-01 14:23:33.000000', '2025-12-01 14:23:33.000000', NULL, b'1', NULL, 'SEMESTER_4', 'e89764c1-cb6d-4cc7-8b5f-8f3a8052539b', '3abe3528-a24e-4265-9aec-36f6d1c598fd'),
('eae9a8cf-7d4d-4734-8784-bf908148d2ee', '2025-12-01 14:23:37.000000', '2025-12-01 14:23:37.000000', NULL, b'1', NULL, 'SEMESTER_1', '0cf6013e-bd05-41c9-ab19-1adedbdbaeed', 'ee744a66-5d47-4322-97a0-bf5bbfea4db3'),
('f2cd6999-283f-473f-b146-20ba724eb268', '2025-12-01 14:23:33.000000', '2025-12-01 14:23:33.000000', NULL, b'1', NULL, 'SEMESTER_4', 'b6c0d278-038b-41ba-b250-72169ad8f67c', '3abe3528-a24e-4265-9aec-36f6d1c598fd'),
('f3e5ea93-c601-456b-93ed-d1dfdd02a2d2', '2025-12-01 14:23:49.000000', '2025-12-01 14:23:49.000000', NULL, b'1', NULL, 'SEMESTER_3', '0d8d9c5b-6459-4788-8d04-6b56ab7d6407', '072dbc3e-5b95-4c20-8c52-00903c3a4178'),
('f433dcfc-01ad-4aea-9a80-4c2a5018b134', '2025-12-01 14:23:33.000000', '2025-12-01 14:23:33.000000', NULL, b'1', NULL, 'SEMESTER_3', 'e6d01da9-4553-4de2-87a2-42d767839e18', '3abe3528-a24e-4265-9aec-36f6d1c598fd'),
('f4fa048a-5015-4b8c-9608-be97c9edf2b2', '2025-12-01 14:23:37.000000', '2025-12-01 14:23:37.000000', NULL, b'1', NULL, 'SEMESTER_3', 'de8fbd9a-144e-45df-a99e-fc3f973fda1e', 'ee744a66-5d47-4322-97a0-bf5bbfea4db3'),
('f54f3670-c67e-472f-8203-2ef8effe66c3', '2025-12-01 14:23:37.000000', '2025-12-01 14:23:37.000000', NULL, b'1', NULL, 'SEMESTER_2', 'ab5a537a-fc70-4ab7-9419-4043f0eb1a1b', 'ee744a66-5d47-4322-97a0-bf5bbfea4db3'),
('f88d0688-d357-4f56-b092-0e2d3c55571d', '2025-12-01 14:23:37.000000', '2025-12-01 14:23:37.000000', NULL, b'1', NULL, 'SEMESTER_1', '74357793-e781-405b-ae78-2aaf662ed2b3', 'ee744a66-5d47-4322-97a0-bf5bbfea4db3'),
('fbced186-3488-4063-9078-a1dc74759543', '2025-12-01 14:23:37.000000', '2025-12-01 14:23:37.000000', NULL, b'1', NULL, 'SEMESTER_3', '34590aa2-bb2e-438f-b9e9-e9ba12215f89', 'ee744a66-5d47-4322-97a0-bf5bbfea4db3'),
('fd3f1c59-8c59-441b-9ebf-9877c86e4b8d', '2025-12-01 14:23:49.000000', '2025-12-01 14:23:49.000000', NULL, b'1', NULL, 'SEMESTER_4', 'cbcf1715-d54e-482b-ada7-7a9117f856f2', '072dbc3e-5b95-4c20-8c52-00903c3a4178'),
('ff4f07a6-d6ae-46bf-b863-8d49202508c9', '2025-12-01 14:23:33.000000', '2025-12-01 14:23:33.000000', NULL, b'1', NULL, 'SEMESTER_3', '63c1279d-3264-4f58-b0ef-08aac8827ff2', '3abe3528-a24e-4265-9aec-36f6d1c598fd'),
('ff91bb29-781f-4deb-825d-52f1f995751c', '2025-12-01 14:23:37.000000', '2025-12-01 14:23:37.000000', NULL, b'1', NULL, 'SEMESTER_2', '8c1f2e2e-4354-45e1-98fd-8cb0e12fb5aa', 'ee744a66-5d47-4322-97a0-bf5bbfea4db3');

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
('e11c0dae-69b2-45aa-b918-c133b5390537', '2025-11-30 21:22:40.000000', '2025-11-30 21:22:40.000000', NULL, 'ACTIVE', 'hongson@gmail.com', '$2a$10$sE9A3PefNf/d9iHLmce9W.rSPOr3sThNWD34u6jcJEfYKj4VhtNOy', 'TEACHER', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Nguyễn Hồng Sơn'),
('e785b8b6-a1bf-4ec8-98fd-b343e1eeb5c8', '2025-11-29 17:53:59.000000', '2025-11-29 17:53:59.000000', NULL, 'ACTIVE', 'trannhatanh@gmail.com', '$2a$10$M2Qn3Z70BDb7Z1LDHLBLN.3imIdyvn.qW0KKKaGjWOXUQyW1doM26', 'TEACHER', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Trần Nhật Anh'),
('e9e15b47-a549-4271-a928-dfa2014fa4eb', '2025-11-30 21:23:01.000000', '2025-11-30 21:23:01.000000', NULL, 'ACTIVE', 'minhloan@gmail.com', '$2a$10$VcSgfzd7uO7CZ4QZK3Twqem8M/7uyMlcu3EVLYp9CcaxpCao/CWO6', 'TEACHER', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Lê Thị Minh Loan');

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
('e785b8b6-a1bf-4ec8-98fd-b343e1eeb5c8', 'TEACHER'),
('e11c0dae-69b2-45aa-b918-c133b5390537', 'TEACHER'),
('e9e15b47-a549-4271-a928-dfa2014fa4eb', 'TEACHER');

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
