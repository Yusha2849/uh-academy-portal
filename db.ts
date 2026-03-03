import Database from 'better-sqlite3';
import * as path from "path";
const db = new Database('lms.db');

// Enable foreign keys
db.pragma('foreign_keys = ON');

export function initDb() {
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT,
      full_name TEXT NOT NULL,
      role TEXT CHECK(role IN ('student', 'lecturer', 'admin', 'sysadmin')) NOT NULL,
      status TEXT CHECK(status IN ('pending', 'active', 'suspended')) DEFAULT 'active',
      payment_status TEXT CHECK(payment_status IN ('paid', 'unpaid', 'not_applicable')) DEFAULT 'unpaid',
      google_id TEXT UNIQUE,
      bio TEXT,
      avatar_url TEXT,
      phone_number TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Add columns if they don't exist (for existing databases)
  try { db.exec("ALTER TABLE users ADD COLUMN phone_number TEXT"); } catch (e) {}
  try { db.exec("ALTER TABLE users ADD COLUMN payment_status TEXT CHECK(payment_status IN ('paid', 'unpaid', 'not_applicable')) DEFAULT 'unpaid'"); } catch (e) {}
  try { db.exec("ALTER TABLE users ADD COLUMN google_id TEXT UNIQUE"); } catch (e) {}
  try { db.exec("ALTER TABLE users ALTER COLUMN password DROP NOT NULL"); } catch (e) {} 
  // SQLite doesn't support DROP NOT NULL easily, but we can just make it nullable in the CREATE statement for new DBs.
  // For existing DBs, we might just leave it or handle it. 
  // Actually, better to just make password optional in the CREATE statement.


  // Logs table
  db.exec(`
    CREATE TABLE IF NOT EXISTS logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      action TEXT NOT NULL,
      details TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Courses table
  db.exec(`
    CREATE TABLE IF NOT EXISTS courses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      code TEXT UNIQUE NOT NULL,
      lecturer_id INTEGER, -- Primary lecturer/owner
      thumbnail_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (lecturer_id) REFERENCES users(id)
    )
  `);

  // Course Lecturers table (Many-to-Many)
  db.exec(`
    CREATE TABLE IF NOT EXISTS course_lecturers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      course_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(course_id, user_id),
      FOREIGN KEY (course_id) REFERENCES courses(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Enrollments table
  db.exec(`
    CREATE TABLE IF NOT EXISTS enrollments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      course_id INTEGER NOT NULL,
      status TEXT CHECK(status IN ('active', 'completed', 'dropped')) DEFAULT 'active',
      enrolled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, course_id),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (course_id) REFERENCES courses(id)
    )
  `);

  // Modules table
  db.exec(`
    CREATE TABLE IF NOT EXISTS modules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      course_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      order_index INTEGER NOT NULL,
      created_by INTEGER,
      FOREIGN KEY (course_id) REFERENCES courses(id),
      FOREIGN KEY (created_by) REFERENCES users(id)
    )
  `);

  // Content table (Documents, Video, Audio, Podcasts)
  db.exec(`
    CREATE TABLE IF NOT EXISTS content (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      module_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      type TEXT CHECK(type IN ('document', 'video', 'audio', 'podcast')) NOT NULL,
      url TEXT NOT NULL,
      description TEXT,
      order_index INTEGER NOT NULL,
      allow_download BOOLEAN DEFAULT 0,
      is_external BOOLEAN DEFAULT 0,
      created_by INTEGER,
      FOREIGN KEY (module_id) REFERENCES modules(id),
      FOREIGN KEY (created_by) REFERENCES users(id)
    )
  `);

  // Add columns if they don't exist (for existing databases)
  try { db.exec("ALTER TABLE modules ADD COLUMN created_by INTEGER REFERENCES users(id)"); } catch (e) {}
  try { db.exec("ALTER TABLE content ADD COLUMN created_by INTEGER REFERENCES users(id)"); } catch (e) {}

  // Content Progress table (Tracking viewed status)
  db.exec(`
    CREATE TABLE IF NOT EXISTS content_progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      content_id INTEGER NOT NULL,
      is_viewed BOOLEAN DEFAULT 0,
      viewed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, content_id),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (content_id) REFERENCES content(id)
    )
  `);

  // Assignments table
  db.exec(`
    CREATE TABLE IF NOT EXISTS assignments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      module_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      due_date DATETIME,
      allow_late BOOLEAN DEFAULT 0,
      late_penalty_percent INTEGER DEFAULT 0,
      max_points INTEGER DEFAULT 100,
      grades_released BOOLEAN DEFAULT 0,
      rubric_json TEXT, -- JSON structure for rubric criteria
      min_word_count INTEGER DEFAULT 0,
      allowed_file_types TEXT DEFAULT '*', -- comma separated e.g. '.pdf,.docx'
      FOREIGN KEY (module_id) REFERENCES modules(id)
    )
  `);

  // Submissions table
  db.exec(`
    CREATE TABLE IF NOT EXISTS submissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      assignment_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      file_url TEXT,
      file_name TEXT,
      text_content TEXT,
      word_count INTEGER DEFAULT 0,
      grade INTEGER,
      feedback TEXT,
      rubric_scores_json TEXT, -- JSON for individual rubric criteria scores
      submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (assignment_id) REFERENCES assignments(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Question Banks
  db.exec(`
    CREATE TABLE IF NOT EXISTS question_banks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      course_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      FOREIGN KEY (course_id) REFERENCES courses(id)
    )
  `);

  // Tests table
  db.exec(`
    CREATE TABLE IF NOT EXISTS tests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      module_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      time_limit_minutes INTEGER DEFAULT 60,
      attempt_limit INTEGER DEFAULT 1,
      is_randomized BOOLEAN DEFAULT 0,
      random_count INTEGER DEFAULT 0, -- Pull X questions if randomized
      passing_score INTEGER DEFAULT 0,
      show_results_immediately BOOLEAN DEFAULT 1,
      FOREIGN KEY (module_id) REFERENCES modules(id)
    )
  `);

  // Questions table
  db.exec(`
    CREATE TABLE IF NOT EXISTS questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      test_id INTEGER, -- Null if in bank
      bank_id INTEGER, -- Null if specific to test
      question_text TEXT NOT NULL,
      type TEXT CHECK(type IN ('multiple_choice', 'true_false', 'short_answer', 'essay')) NOT NULL,
      options TEXT, -- JSON array for multiple choice
      correct_answer TEXT,
      points INTEGER DEFAULT 1,
      FOREIGN KEY (test_id) REFERENCES tests(id),
      FOREIGN KEY (bank_id) REFERENCES question_banks(id)
    )
  `);

  // Test Results table
  db.exec(`
    CREATE TABLE IF NOT EXISTS test_results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      test_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      score INTEGER DEFAULT 0,
      status TEXT CHECK(status IN ('in_progress', 'submitted', 'graded')) DEFAULT 'in_progress',
      answers_json TEXT, -- Current progress / final answers
      scores_json TEXT, -- JSON map of question_id -> score
      started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      submitted_at DATETIME,
      time_spent_seconds INTEGER DEFAULT 0,
      FOREIGN KEY (test_id) REFERENCES tests(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Add columns if they don't exist (for existing databases)
  try { db.exec("ALTER TABLE test_results ADD COLUMN scores_json TEXT"); } catch (e) {}

  // Forums table
  db.exec(`
    CREATE TABLE IF NOT EXISTS forums (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      course_id INTEGER NOT NULL,
      module_id INTEGER, -- Optional: link to specific module
      title TEXT NOT NULL,
      description TEXT,
      FOREIGN KEY (course_id) REFERENCES courses(id),
      FOREIGN KEY (module_id) REFERENCES modules(id)
    )
  `);

  // Forum Posts table
  db.exec(`
    CREATE TABLE IF NOT EXISTS forum_posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      forum_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      parent_id INTEGER, -- For replies
      title TEXT, -- Only for threads
      content TEXT NOT NULL,
      is_pinned BOOLEAN DEFAULT 0,
      is_reported BOOLEAN DEFAULT 0,
      report_reason TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (forum_id) REFERENCES forums(id),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (parent_id) REFERENCES forum_posts(id)
    )
  `);

  // Notifications table
  db.exec(`
    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      type TEXT NOT NULL, -- 'reply', 'grade', etc.
      content TEXT NOT NULL,
      link TEXT,
      is_read BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Seed some initial data if empty
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  if (userCount.count === 0) {
    // Passwords should be hashed in production, but for this demo we'll use plain text or simple hash
    const insertUser = db.prepare('INSERT INTO users (email, password, full_name, role) VALUES (?, ?, ?, ?)');
    insertUser.run('admin@uhacademy.edu', 'admin123', 'System Administrator', 'sysadmin');
    insertUser.run('lecturer@uhacademy.edu', 'lecturer123', 'Dr. Jane Smith', 'lecturer');
    insertUser.run('student@uhacademy.edu', 'student123', 'John Doe', 'student');

    const insertCourse = db.prepare('INSERT INTO courses (title, description, code, lecturer_id) VALUES (?, ?, ?, ?)');
    insertCourse.run('Imam Ghazali (Ayyuha Walad)', 'Study of Imam Ghazali\'s famous work.', 'IG101', 2);
    insertCourse.run('Tahalli', 'The art of spiritual adornment.', 'TH101', 2);
    insertCourse.run('Sunnahs', 'The traditions and practices of the Prophet.', 'SN101', 2);
    insertCourse.run('Tafseer', 'Exegesis and interpretation of the Quran.', 'TF101', 2);
    insertCourse.run('Baa in Bismillah to the Seen in Naas', 'A comprehensive study of the Quranic text.', 'BS101', 2);
    insertCourse.run('Shamaail-Tirmindhi', 'Study of the characteristics of the Prophet.', 'ST101', 2);
    insertCourse.run('Secrets of those drawn near', 'Spiritual insights and mystical knowledge.', 'SD101', 2);
    insertCourse.run('Umatan Wasataa', 'The concept of the middle nation in Islam.', 'UW101', 2);
    insertCourse.run('Riyaadus-Saaliheen', 'The Meadows of the Righteous - Hadith collection.', 'RS101', 2);

    const insertEnrollment = db.prepare('INSERT INTO enrollments (user_id, course_id) VALUES (?, ?)');
    insertEnrollment.run(3, 1);
  }

  // Migration: Update any pending users to active to resolve "not enabled" issues for existing accounts
  try {
    db.prepare("UPDATE users SET status = 'active' WHERE status = 'pending'").run();
  } catch (e) {
    console.error("Failed to update pending users:", e);
  }

  // Migration: Replace existing courses with Islamic courses if not already done
  try {
    const checkCourse = db.prepare("SELECT COUNT(*) as count FROM courses WHERE code = 'IG101'").get() as { count: number };
    if (checkCourse.count === 0) {
      console.log("Migrating courses to Islamic curriculum...");
      
      // Delete related data first due to foreign key constraints (since no CASCADE)
      db.prepare("DELETE FROM forum_posts WHERE forum_id IN (SELECT id FROM forums WHERE course_id IN (SELECT id FROM courses))").run();
      db.prepare("DELETE FROM forums WHERE course_id IN (SELECT id FROM courses)").run();
      db.prepare("DELETE FROM question_banks WHERE course_id IN (SELECT id FROM courses)").run();
      db.prepare("DELETE FROM enrollments WHERE course_id IN (SELECT id FROM courses)").run();
      db.prepare("DELETE FROM course_lecturers WHERE course_id IN (SELECT id FROM courses)").run();
      
      // Delete modules and their content/assignments/tests
      const courses = db.prepare("SELECT id FROM courses").all() as { id: number }[];
      for (const course of courses) {
        const modules = db.prepare("SELECT id FROM modules WHERE course_id = ?").all(course.id) as { id: number }[];
        for (const module of modules) {
          db.prepare("DELETE FROM content_progress WHERE content_id IN (SELECT id FROM content WHERE module_id = ?)").run(module.id);
          db.prepare("DELETE FROM content WHERE module_id = ?").run(module.id);
          db.prepare("DELETE FROM submissions WHERE assignment_id IN (SELECT id FROM assignments WHERE module_id = ?)").run(module.id);
          db.prepare("DELETE FROM assignments WHERE module_id = ?").run(module.id);
          db.prepare("DELETE FROM test_results WHERE test_id IN (SELECT id FROM tests WHERE module_id = ?)").run(module.id);
          db.prepare("DELETE FROM questions WHERE test_id IN (SELECT id FROM tests WHERE module_id = ?)").run(module.id);
          db.prepare("DELETE FROM tests WHERE module_id = ?").run(module.id);
        }
        db.prepare("DELETE FROM modules WHERE course_id = ?").run(course.id);
      }
      
      db.prepare("DELETE FROM courses").run();

      const insertCourse = db.prepare('INSERT INTO courses (title, description, code, lecturer_id) VALUES (?, ?, ?, ?)');
      insertCourse.run('Imam Ghazali (Ayyuha Walad)', 'Study of Imam Ghazali\'s famous work.', 'IG101', 2);
      insertCourse.run('Tahalli', 'The art of spiritual adornment.', 'TH101', 2);
      insertCourse.run('Sunnahs', 'The traditions and practices of the Prophet.', 'SN101', 2);
      insertCourse.run('Tafseer', 'Exegesis and interpretation of the Quran.', 'TF101', 2);
      insertCourse.run('Baa in Bismillah to the Seen in Naas', 'A comprehensive study of the Quranic text.', 'BS101', 2);
      insertCourse.run('Shamaail-Tirmindhi', 'Study of the characteristics of the Prophet.', 'ST101', 2);
      insertCourse.run('Secrets of those drawn near', 'Spiritual insights and mystical knowledge.', 'SD101', 2);
      insertCourse.run('Umatan Wasataa', 'The concept of the middle nation in Islam.', 'UW101', 2);
      insertCourse.run('Riyaadus-Saaliheen', 'The Meadows of the Righteous - Hadith collection.', 'RS101', 2);
      
      console.log("Islamic courses migration completed.");
    }
  } catch (e) {
    console.error("Failed to migrate courses:", e);
  }
}

export default db;
