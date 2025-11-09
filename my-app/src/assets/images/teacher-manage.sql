-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 09, 2025 at 06:30 AM
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
  `attempt` int(11) NOT NULL,
  `exam_date` date DEFAULT NULL,
  `result` enum('PASS','FAIL') DEFAULT NULL,
  `score` int(11) DEFAULT NULL,
  `certificate_file_id` varchar(255) DEFAULT NULL,
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
  `file_path` varchar(255) DEFAULT NULL,
  `type` varchar(255) DEFAULT NULL,
  `creation_timestamp` datetime(6) DEFAULT NULL,
  `update_timestamp` datetime(6) DEFAULT NULL,
  `checksum` varchar(128) DEFAULT NULL,
  `file_name` varchar(255) DEFAULT NULL,
  `size_bytes` bigint(20) DEFAULT NULL,
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
  `type` varchar(50) DEFAULT NULL,
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
-- Table structure for table `subjects`
--

CREATE TABLE `subjects` (
  `id` varchar(255) NOT NULL,
  `creation_timestamp` datetime(6) DEFAULT NULL,
  `update_timestamp` datetime(6) DEFAULT NULL,
  `credit` int(11) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `is_active` bit(1) NOT NULL,
  `subject_code` varchar(20) NOT NULL,
  `subject_name` varchar(100) NOT NULL,
  `system` enum('APTECH','ARENA') DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `subject_registrations`
--

CREATE TABLE `subject_registrations` (
  `id` varchar(255) NOT NULL,
  `creation_timestamp` datetime(6) DEFAULT NULL,
  `update_timestamp` datetime(6) DEFAULT NULL,
  `quarter` int(11) NOT NULL,
  `reason_for_carry_over` text DEFAULT NULL,
  `status` enum('REGISTERED','COMPLETED','NOT_COMPLETED') NOT NULL,
  `year` int(11) NOT NULL,
  `carried_from_id` varchar(255) DEFAULT NULL,
  `subject_id` varchar(255) NOT NULL,
  `teacher_id` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
  `quarter` int(11) NOT NULL,
  `status` enum('ASSIGNED','COMPLETED','NOT_COMPLETED','FAILED') NOT NULL,
  `year` int(11) NOT NULL,
  `assigned_by` varchar(255) DEFAULT NULL,
  `subject_id` varchar(255) NOT NULL,
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
  `file_report_id` varchar(255) DEFAULT NULL,
  `trial_id` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `trial_teachings`
--

CREATE TABLE `trial_teachings` (
  `id` varchar(255) NOT NULL,
  `creation_timestamp` datetime(6) DEFAULT NULL,
  `update_timestamp` datetime(6) DEFAULT NULL,
  `location` varchar(100) DEFAULT NULL,
  `note` text DEFAULT NULL,
  `status` enum('PENDING','REVIEWED') NOT NULL,
  `teaching_date` date NOT NULL,
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
  `active` enum('ACTIVE','INACTIVE') DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `primary_role` enum('MANAGE','TEACHER') DEFAULT NULL,
  `about_me` varchar(255) DEFAULT NULL,
  `academic_rank` varchar(255) DEFAULT NULL,
  `birth_date` datetime(6) DEFAULT NULL,
  `first_name` varchar(255) DEFAULT NULL,
  `gender` tinyint(4) DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `last_name` varchar(255) DEFAULT NULL,
  `phone_number` varchar(255) DEFAULT NULL,
  `username` varchar(255) NOT NULL,
  `avatar_file_id` varchar(64) DEFAULT NULL,
  `last_login` datetime(6) DEFAULT NULL,
  `teacher_code` varchar(20) DEFAULT NULL,
  `teacher_status` enum('ACTIVE','INACTIVE') DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `creation_timestamp`, `update_timestamp`, `active`, `email`, `password`, `primary_role`, `about_me`, `academic_rank`, `birth_date`, `first_name`, `gender`, `image_url`, `last_name`, `phone_number`, `username`, `avatar_file_id`, `last_login`, `teacher_code`, `teacher_status`) VALUES
('ea089c84-f49b-456d-98a3-5313117a2891', NULL, '2025-11-08 21:30:00.000000', 'ACTIVE', 'nguyentrungthuan417@gmail.com', '$2a$10$Gp/c9xdL6jOUGU4BKoY4IuK/1rStdX/a4uSWBC13.5V.UPcT5dLXO', 'TEACHER', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'admin', NULL, NULL, NULL, NULL),
('ea089c84-f49b-456d-98a3-5313117a2898', NULL, NULL, 'ACTIVE', 'thuannguyen417@gmail.com', '$2a$10$mSqRLDmAXlUyN24pd5NoJ.w.7xnlzLwkfflhFhLcCkj8hM1mEzfnq', 'TEACHER', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'teacher', NULL, NULL, NULL, NULL),
('ea089c84-f49b-456d-98a3-5313117a2899', '2025-11-07 22:48:32.000000', '2025-11-07 22:48:32.000000', 'ACTIVE', 'thuannguyen418@gmail.com', '$2a$10$mSqRLDmAXlUyN24pd5NoJ.w.7xnlzLwkfflhFhLcCkj8hM1mEzfnq', 'MANAGE', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'admin', NULL, NULL, NULL, NULL);

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
('ea089c84-f49b-456d-98a3-5313117a2899', 'MANAGE'),
('ea089c84-f49b-456d-98a3-5313117a2898', 'TEACHER'),
('ea089c84-f49b-456d-98a3-5313117a2891', 'TEACHER');

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
-- Indexes for table `subjects`
--
ALTER TABLE `subjects`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `UK_qt734ivq9gq4yo4p1j1lhhk8l` (`subject_code`),
  ADD KEY `idx_subject_name` (`subject_name`),
  ADD KEY `idx_system` (`system`),
  ADD KEY `idx_is_active` (`is_active`);

--
-- Indexes for table `subject_registrations`
--
ALTER TABLE `subject_registrations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `UQ_SubjectRegistration` (`teacher_id`,`subject_id`,`year`,`quarter`),
  ADD KEY `idx_teacher_year_quarter` (`teacher_id`,`year`,`quarter`),
  ADD KEY `idx_subject_year_quarter` (`subject_id`,`year`,`quarter`),
  ADD KEY `idx_year_quarter` (`year`,`quarter`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `FK96a4g1lyustrcd8cnw7o5gr3t` (`carried_from_id`);

--
-- Indexes for table `teaching_assignments`
--
ALTER TABLE `teaching_assignments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `UQ_Assignment` (`teacher_id`,`subject_id`,`year`,`quarter`),
  ADD KEY `idx_status_year_quarter` (`status`,`year`,`quarter`),
  ADD KEY `idx_teacher_year_quarter` (`teacher_id`,`year`,`quarter`),
  ADD KEY `FKdfk2ifgn98csuwv819dh6kd0` (`assigned_by`),
  ADD KEY `FK3xdxo1bu1pmp99lnjsgxh7foq` (`subject_id`);

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
  ADD UNIQUE KEY `UK_gldfeii8955ny68nqpnnlpfq4` (`trial_id`),
  ADD KEY `idx_trial_id` (`trial_id`),
  ADD KEY `FKrtkgpfu4udrp2w89v6vxsp5un` (`file_report_id`);

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
-- Constraints for table `subject_registrations`
--
ALTER TABLE `subject_registrations`
  ADD CONSTRAINT `FK96a4g1lyustrcd8cnw7o5gr3t` FOREIGN KEY (`carried_from_id`) REFERENCES `subject_registrations` (`id`),
  ADD CONSTRAINT `FKcuwkpdnmlgnbfvsv7dd9yyjxt` FOREIGN KEY (`teacher_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `FKhyurhiaseffdjn4kpwmq3b0wx` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`);

--
-- Constraints for table `teaching_assignments`
--
ALTER TABLE `teaching_assignments`
  ADD CONSTRAINT `FK3xdxo1bu1pmp99lnjsgxh7foq` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`),
  ADD CONSTRAINT `FK5ei7j09hqhq92dbfccqm6yvvo` FOREIGN KEY (`teacher_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `FKdfk2ifgn98csuwv819dh6kd0` FOREIGN KEY (`assigned_by`) REFERENCES `users` (`id`);

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
  ADD CONSTRAINT `FKrtkgpfu4udrp2w89v6vxsp5un` FOREIGN KEY (`file_report_id`) REFERENCES `files` (`id`);

--
-- Constraints for table `trial_teachings`
--
ALTER TABLE `trial_teachings`
  ADD CONSTRAINT `FKb6wurukh28x8xsiyvx556dimf` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`),
  ADD CONSTRAINT `FKb756uyc591d9xdumkuk8kecyl` FOREIGN KEY (`aptech_exam_id`) REFERENCES `aptech_exams` (`id`),
  ADD CONSTRAINT `FKc0n2tbfx3hbokl8t1a0shn1u7` FOREIGN KEY (`teacher_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `user_roles`
--
ALTER TABLE `user_roles`
  ADD CONSTRAINT `FKhfh9dx7w3ubf1co1vdev94g3f` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
