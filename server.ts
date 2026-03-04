import express from "express";
import { createServer as createViteServer } from "vite";
import { initDb } from "./db.js";
import db from "./db.js";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import * as path from "path";import cors from "cors";

const JWT_SECRET = process.env.JWT_SECRET || "lms-secret-key";

async function startServer() {
  console.log("Starting server...");
  initDb();
  console.log("Database initialized.");
  const app = express();
  app.use(cors());
const PORT = process.env.PORT || 3000;
  app.use(express.json());
  app.use(cookieParser());

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Helper for logging
  const logAction = (userId: number | null, action: string, details: string) => {
    db.prepare('INSERT INTO logs (user_id, action, details) VALUES (?, ?, ?)').run(userId, action, details);
  };

  // Auth Middleware
  const authenticate = (req: any, res: any, next: any) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: "Unauthorized" });
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      next();
    } catch (err) {
      res.status(401).json({ error: "Invalid token" });
    }
  };

  // --- API Routes ---

  // Auth
  app.post("/api/auth/register", (req, res) => {
    const { email, password, full_name, role, phone_number } = req.body;
    try {
      // All users start as pending and must be approved by an admin
      const status = 'pending';
      const result = db.prepare('INSERT INTO users (email, password, full_name, role, status, phone_number) VALUES (?, ?, ?, ?, ?, ?)').run(email, password, full_name, role, status, phone_number);
      logAction(Number(result.lastInsertRowid), 'register', `User registered as ${role}`);
      res.json({ success: true, id: result.lastInsertRowid });
    } catch (err: any) {
      res.status(400).json({ error: err.message || "Registration failed" });
    }
  });

  // Google Auth
  app.get('/api/auth/google/url', (req, res) => {
    const redirectUri = `${process.env.APP_URL}/auth/google/callback`;
    const params = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID || 'mock-client-id',
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
    });
    res.json({ url: `https://accounts.google.com/o/oauth2/v2/auth?${params}` });
  });

  app.get('/auth/google/callback', async (req, res) => {
    const { code } = req.query;
    if (!code) return res.status(400).send("No code provided");

    try {
      // In a real app, we would exchange the code for tokens here
      // For this demo, we'll simulate the Google user info
      
      const mockGoogleUser = {
        id: 'google-123',
        email: 'google-user@example.com',
        name: 'Google User'
      };

      let user = db.prepare('SELECT * FROM users WHERE google_id = ? OR email = ?').get(mockGoogleUser.id, mockGoogleUser.email) as any;

      if (!user) {
        const result = db.prepare('INSERT INTO users (email, full_name, role, status, google_id) VALUES (?, ?, ?, ?, ?)').run(
          mockGoogleUser.email,
          mockGoogleUser.name,
          'student', // Default role for Google signups
          'pending', // All new users are pending
          mockGoogleUser.id
        );
        user = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid);
        logAction(user.id, 'register', 'User registered via Google');
      }

      if (user && !user.google_id) {
        db.prepare('UPDATE users SET google_id = ? WHERE id = ?').run(mockGoogleUser.id, user.id);
      }

      // Create token for the user
      const token = jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.full_name }, JWT_SECRET);
      res.cookie("token", token, { httpOnly: true, secure: true, sameSite: 'none' });

      res.send(`
        <html>
          <body>
            <script>
              if (window.opener) {
                window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS' }, '*');
                window.close();
              } else {
                window.location.href = '/';
              }
            </script>
            <p>Authentication successful. This window should close automatically.</p>
          </body>
        </html>
      `);
    } catch (err) {
      res.status(500).send("Authentication failed");
    }
  });

  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE email = ? AND password = ?').get(email, password) as any;
    if (user) {
      if (user.status === 'pending') {
        return res.status(403).json({ error: "Your account is pending approval by an administrator." });
      }
      if (user.status === 'suspended') {
        return res.status(403).json({ error: "Your account has been suspended." });
      }
      const token = jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.full_name }, JWT_SECRET);
      res.cookie("token", token, { httpOnly: true, secure: true, sameSite: 'none' });
      logAction(user.id, 'login', 'User logged in');
      res.json({ user: { id: user.id, email: user.email, role: user.role, name: user.full_name } });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    res.clearCookie("token");
    res.json({ success: true });
  });

  app.get("/api/auth/me", authenticate, (req: any, res) => {
    res.json({ user: req.user });
  });

  // Student Dashboard Stats
  app.get("/api/student/dashboard", authenticate, (req: any, res) => {
    const userId = req.user.id;
    
    const enrolledCount = db.prepare('SELECT COUNT(*) as count FROM enrollments WHERE user_id = ?').get(userId) as any;
    
    const upcomingAssignments = db.prepare(`
      SELECT a.*, c.title as course_title, c.code as course_code
      FROM assignments a
      JOIN modules m ON a.module_id = m.id
      JOIN courses c ON m.course_id = c.id
      JOIN enrollments e ON c.id = e.course_id
      WHERE e.user_id = ? AND a.due_date > CURRENT_TIMESTAMP
      ORDER BY a.due_date ASC
      LIMIT 5
    `).all(userId);

    const recentActivity = db.prepare(`
      SELECT 'content' as type, c.title, cp.viewed_at as date, co.title as course_title
      FROM content_progress cp
      JOIN content c ON cp.content_id = c.id
      JOIN modules m ON c.module_id = m.id
      JOIN courses co ON m.course_id = co.id
      WHERE cp.user_id = ?
      UNION ALL
      SELECT 'forum' as type, p.content as title, p.created_at as date, co.title as course_title
      FROM forum_posts p
      JOIN forums f ON p.forum_id = f.id
      JOIN courses co ON f.course_id = co.id
      WHERE p.user_id = ?
      ORDER BY date DESC
      LIMIT 10
    `).all(userId, userId);

    const courseProgress = db.prepare(`
      SELECT 
        c.id, 
        c.title, 
        c.code,
        (SELECT COUNT(*) FROM content co JOIN modules m ON co.module_id = m.id WHERE m.course_id = c.id) as total_content,
        (SELECT COUNT(*) FROM content_progress cp JOIN content co ON cp.content_id = co.id JOIN modules m ON co.module_id = m.id WHERE m.course_id = c.id AND cp.user_id = ?) as viewed_content
      FROM courses c
      JOIN enrollments e ON c.id = e.course_id
      WHERE e.user_id = ?
    `).all(userId, userId);

    res.json({
      stats: {
        enrolled: enrolledCount.count,
        upcoming: upcomingAssignments.length,
        gpa: 3.8 // Mocked for now
      },
      upcomingAssignments,
      recentActivity,
      courseProgress
    });
  });

  // Lecturer Dashboard Stats
  app.get("/api/lecturer/dashboard", authenticate, (req: any, res) => {
    if (req.user.role !== 'lecturer' && req.user.role !== 'admin' && req.user.role !== 'sysadmin') return res.status(403).json({ error: "Forbidden" });
    const userId = req.user.id;

    const totalStudents = db.prepare(`
      SELECT COUNT(DISTINCT e.user_id) as count 
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      WHERE c.lecturer_id = ?
    `).get(userId) as any;

    const pendingSubmissions = db.prepare(`
      SELECT 
        s.id as submission_id, 
        s.submitted_at, 
        u.full_name as student_name, 
        a.title as item_title, 
        'assignment' as type,
        c.title as course_title,
        c.id as course_id,
        a.id as item_id
      FROM submissions s
      JOIN assignments a ON s.assignment_id = a.id
      JOIN modules m ON a.module_id = m.id
      JOIN courses c ON m.course_id = c.id
      JOIN users u ON s.user_id = u.id
      WHERE c.lecturer_id = ? AND s.grade IS NULL

      UNION ALL

      SELECT 
        tr.id as submission_id, 
        tr.submitted_at, 
        u.full_name as student_name, 
        t.title as item_title, 
        'test' as type,
        c.title as course_title,
        c.id as course_id,
        tr.id as item_id
      FROM test_results tr
      JOIN tests t ON tr.test_id = t.id
      JOIN modules m ON t.module_id = m.id
      JOIN courses c ON m.course_id = c.id
      JOIN users u ON tr.user_id = u.id
      WHERE c.lecturer_id = ? AND tr.status = 'submitted'

      ORDER BY submitted_at DESC
      LIMIT 10
    `).all(userId, userId);

    const forumActivity = db.prepare(`
      SELECT p.*, u.full_name as user_name, f.title as forum_title, c.title as course_title
      FROM forum_posts p
      JOIN forums f ON p.forum_id = f.id
      JOIN courses c ON f.course_id = c.id
      JOIN users u ON p.user_id = u.id
      WHERE c.lecturer_id = ?
      ORDER BY p.created_at DESC
      LIMIT 10
    `).all(userId);

    const courseStats = db.prepare(`
      SELECT c.id, c.title, c.code,
             (SELECT COUNT(*) FROM enrollments e WHERE e.course_id = c.id) as student_count,
             (
               (SELECT COUNT(*) FROM submissions s JOIN assignments a ON s.assignment_id = a.id JOIN modules m ON a.module_id = m.id WHERE m.course_id = c.id AND s.grade IS NULL) 
               + 
               (SELECT COUNT(*) FROM test_results tr JOIN tests t ON tr.test_id = t.id JOIN modules m ON t.module_id = m.id WHERE m.course_id = c.id AND tr.status = 'submitted')
             ) as pending_grades
      FROM courses c
      WHERE c.lecturer_id = ?
    `).all(userId);

    // Calculate total pending grades across all courses
    const totalPendingGrades = courseStats.reduce((acc: number, course: any) => acc + course.pending_grades, 0);

    res.json({
      stats: {
        totalStudents: totalStudents.count,
        pendingGrades: totalPendingGrades,
        forumNew: forumActivity.length
      },
      pendingSubmissions,
      forumActivity,
      courseStats
    });
  });

  app.get("/api/lecturer/students", authenticate, (req: any, res) => {
    if (req.user.role !== 'lecturer' && req.user.role !== 'admin' && req.user.role !== 'sysadmin') return res.status(403).json({ error: "Forbidden" });
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin' || req.user.role === 'sysadmin';

    const students = isAdmin ?
      db.prepare(`
        SELECT DISTINCT u.id, u.full_name, u.email, u.avatar_url, c.title as course_title, c.code as course_code, e.enrolled_at
        FROM users u
        JOIN enrollments e ON u.id = e.user_id
        JOIN courses c ON e.course_id = c.id
        ORDER BY e.enrolled_at DESC
      `).all() :
      db.prepare(`
        SELECT DISTINCT u.id, u.full_name, u.email, u.avatar_url, c.title as course_title, c.code as course_code, e.enrolled_at
        FROM users u
        JOIN enrollments e ON u.id = e.user_id
        JOIN courses c ON e.course_id = c.id
        WHERE c.lecturer_id = ?
        ORDER BY e.enrolled_at DESC
      `).all(userId);

    res.json(students);
  });

  app.get("/api/courses/:id/lecturer-grades", authenticate, (req: any, res) => {
    if (req.user.role !== 'lecturer' && req.user.role !== 'admin' && req.user.role !== 'sysadmin') return res.status(403).json({ error: "Forbidden" });
    const courseId = req.params.id;

    const submissions = db.prepare(`
      SELECT s.*, u.full_name as student_name, a.title as assignment_title, a.max_points
      FROM submissions s
      JOIN assignments a ON s.assignment_id = a.id
      JOIN modules m ON a.module_id = m.id
      JOIN users u ON s.user_id = u.id
      WHERE m.course_id = ?
      ORDER BY s.submitted_at DESC
    `).all(courseId);

    const testResults = db.prepare(`
      SELECT tr.*, u.full_name as student_name, t.title as test_title,
             (SELECT SUM(points) FROM questions q WHERE q.test_id = t.id) as max_score
      FROM test_results tr
      JOIN tests t ON tr.test_id = t.id
      JOIN modules m ON t.module_id = m.id
      JOIN users u ON tr.user_id = u.id
      WHERE m.course_id = ? AND tr.status != 'in_progress'
      ORDER BY tr.submitted_at DESC
    `).all(courseId);

    res.json({ submissions, testResults });
  });

  // Community Forums
  app.get("/api/community/forums", authenticate, (req: any, res) => {
    const userId = req.user.id;
    let forums;
    if (req.user.role === 'admin' || req.user.role === 'sysadmin') {
      forums = db.prepare(`
        SELECT f.*, c.title as course_title, c.code as course_code,
               (SELECT COUNT(*) FROM forum_posts p WHERE p.forum_id = f.id) as post_count
        FROM forums f
        JOIN courses c ON f.course_id = c.id
        GROUP BY f.id
        ORDER BY c.title ASC
      `).all();
    } else {
      forums = db.prepare(`
        SELECT f.*, c.title as course_title, c.code as course_code,
               (SELECT COUNT(*) FROM forum_posts p WHERE p.forum_id = f.id) as post_count
        FROM forums f
        JOIN courses c ON f.course_id = c.id
        LEFT JOIN enrollments e ON c.id = e.course_id
        WHERE e.user_id = ? OR c.lecturer_id = ?
        GROUP BY f.id
        ORDER BY c.title ASC
      `).all(userId, userId);
    }
    res.json(forums);
  });

  // Courses
  app.post("/api/courses", authenticate, (req: any, res) => {
    if (req.user.role !== 'lecturer' && req.user.role !== 'admin' && req.user.role !== 'sysadmin') {
      return res.status(403).json({ error: "Forbidden" });
    }
    const { title, description, code, thumbnail_url } = req.body;
    try {
      const result = db.prepare('INSERT INTO courses (title, description, code, lecturer_id, thumbnail_url) VALUES (?, ?, ?, ?, ?)').run(title, description, code, req.user.id, thumbnail_url || null);
      logAction(req.user.id, 'create_course', `Created course ${code}: ${title}`);
      res.json({ success: true, id: result.lastInsertRowid });
    } catch (err: any) {
      res.status(400).json({ error: err.message || "Failed to create course" });
    }
  });

  app.patch("/api/courses/:id", authenticate, (req: any, res) => {
    if (req.user.role !== 'lecturer' && req.user.role !== 'admin' && req.user.role !== 'sysadmin') {
      return res.status(403).json({ error: "Forbidden" });
    }
    const { title, description, code, thumbnail_url } = req.body;
    try {
      const course = db.prepare('SELECT lecturer_id FROM courses WHERE id = ?').get(req.params.id) as any;
      if (!course) return res.status(404).json({ error: "Course not found" });
      
      if (req.user.role !== 'admin' && req.user.role !== 'sysadmin' && course.lecturer_id !== req.user.id) {
        return res.status(403).json({ error: "Forbidden: You can only edit your own courses" });
      }

      db.prepare('UPDATE courses SET title = ?, description = ?, code = ?, thumbnail_url = ? WHERE id = ?')
        .run(title, description, code, thumbnail_url || null, req.params.id);
      
      logAction(req.user.id, 'update_course', `Updated course ${req.params.id}`);
      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ error: err.message || "Failed to update course" });
    }
  });

  app.get("/api/courses", authenticate, (req: any, res) => {
    const courses = db.prepare(`
      SELECT c.*, u.full_name as lecturer_name 
      FROM courses c 
      LEFT JOIN users u ON c.lecturer_id = u.id
    `).all();
    res.json(courses);
  });

  app.get("/api/courses/my", authenticate, (req: any, res) => {
    let courses;
    if (req.user.role === 'student') {
      courses = db.prepare(`
        SELECT c.*, u.full_name as lecturer_name 
        FROM courses c 
        JOIN enrollments e ON c.id = e.course_id 
        LEFT JOIN users u ON c.lecturer_id = u.id
        WHERE e.user_id = ?
      `).all(req.user.id);
    } else if (req.user.role === 'lecturer') {
      courses = db.prepare(`
        SELECT c.*, u.full_name as lecturer_name 
        FROM courses c 
        LEFT JOIN users u ON c.lecturer_id = u.id
        WHERE c.lecturer_id = ?
      `).all(req.user.id);
    } else {
      courses = db.prepare(`
        SELECT c.*, u.full_name as lecturer_name 
        FROM courses c 
        LEFT JOIN users u ON c.lecturer_id = u.id
      `).all();
    }
    res.json(courses);
  });

  app.get("/api/courses/:id", authenticate, (req: any, res) => {
    const userId = req.user.id;
    const course = db.prepare(`
      SELECT c.*, u.full_name as lecturer_name 
      FROM courses c 
      LEFT JOIN users u ON c.lecturer_id = u.id
      WHERE c.id = ?
    `).get(req.params.id) as any;

    if (!course) return res.status(404).json({ error: "Course not found" });

    // Get all assigned lecturers
    const lecturers = db.prepare(`
      SELECT u.id, u.full_name, u.email
      FROM users u
      JOIN course_lecturers cl ON u.id = cl.user_id
      WHERE cl.course_id = ?
    `).all(req.params.id);
    
    course.lecturers = lecturers;
    
    const modules = db.prepare(`
      SELECT m.*, u.full_name as creator_name
      FROM modules m
      LEFT JOIN users u ON m.created_by = u.id
      WHERE m.course_id = ? 
      ORDER BY m.order_index
    `).all(req.params.id) as any[];
    
    for (const m of modules) {
      m.assignments = db.prepare(`
        SELECT a.*, 
               s.id as submission_id, 
               s.submitted_at, 
               s.grade,
               CASE WHEN s.id IS NOT NULL THEN 'submitted' ELSE 'pending' END as status
        FROM assignments a
        LEFT JOIN submissions s ON a.id = s.assignment_id AND s.user_id = ?
        WHERE a.module_id = ?
      `).all(userId, m.id);
      m.tests = db.prepare(`
        SELECT t.*, 
               CASE WHEN EXISTS (SELECT 1 FROM test_results tr WHERE tr.test_id = t.id AND tr.user_id = ? AND tr.submitted_at IS NOT NULL) THEN 'completed' ELSE 'pending' END as status
        FROM tests t
        WHERE t.module_id = ?
      `).all(userId, m.id);
      m.content = db.prepare(`
        SELECT c.*, u.full_name as creator_name
        FROM content c
        LEFT JOIN users u ON c.created_by = u.id
        WHERE c.module_id = ? 
        ORDER BY c.order_index
      `).all(m.id);
    }
    
    const enrollment = db.prepare('SELECT * FROM enrollments WHERE user_id = ? AND course_id = ?').get(userId, req.params.id);
    
    res.json({ 
      course, 
      modules, 
      isEnrolled: !!enrollment || req.user.role === 'lecturer' || req.user.role === 'admin' || req.user.role === 'sysadmin'
    });
  });

  app.get("/api/courses/:id/resources", authenticate, (req: any, res) => {
    const userId = req.user.id;
    const resources = db.prepare(`
      SELECT c.*, cp.is_viewed, m.title as module_title, u.full_name as creator_name
      FROM content c
      JOIN modules m ON c.module_id = m.id
      LEFT JOIN content_progress cp ON c.id = cp.content_id AND cp.user_id = ?
      LEFT JOIN users u ON c.created_by = u.id
      WHERE m.course_id = ?
      ORDER BY m.order_index, c.order_index
    `).all(userId, req.params.id);
    res.json(resources);
  });

  // Enrollment
  app.post("/api/courses/:id/enroll", authenticate, (req: any, res) => {
    try {
      db.prepare('INSERT INTO enrollments (user_id, course_id) VALUES (?, ?)').run(req.user.id, req.params.id);
      logAction(req.user.id, 'enroll', `Enrolled in course ${req.params.id}`);
      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ error: "Already enrolled or invalid course" });
    }
  });

  // Modules & Content
  app.post("/api/courses/:id/modules", authenticate, (req: any, res) => {
    if (req.user.role !== 'lecturer' && req.user.role !== 'admin' && req.user.role !== 'sysadmin') return res.status(403).json({ error: "Forbidden" });
    const { title, order_index } = req.body;
    const result = db.prepare('INSERT INTO modules (course_id, title, order_index, created_by) VALUES (?, ?, ?, ?)').run(req.params.id, title, order_index, req.user.id);
    res.json({ id: result.lastInsertRowid });
  });

  app.post("/api/modules/:id/content", authenticate, (req: any, res) => {
    if (req.user.role !== 'lecturer' && req.user.role !== 'admin' && req.user.role !== 'sysadmin') return res.status(403).json({ error: "Forbidden" });
    const { title, type, url, description, order_index, allow_download, is_external } = req.body;
    const result = db.prepare('INSERT INTO content (module_id, title, type, url, description, order_index, allow_download, is_external, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)').run(req.params.id, title, type, url, description, order_index, allow_download ? 1 : 0, is_external ? 1 : 0, req.user.id);
    res.json({ id: result.lastInsertRowid });
  });

  app.get("/api/modules/:id/content", authenticate, (req: any, res) => {
    const content = db.prepare(`
      SELECT c.*, cp.is_viewed, u.full_name as creator_name
      FROM content c 
      LEFT JOIN content_progress cp ON c.id = cp.content_id AND cp.user_id = ?
      LEFT JOIN users u ON c.created_by = u.id
      WHERE c.module_id = ? 
      ORDER BY c.order_index
    `).all(req.user.id, req.params.id);
    const assignments = db.prepare('SELECT * FROM assignments WHERE module_id = ?').all(req.params.id);
    const tests = db.prepare('SELECT * FROM tests WHERE module_id = ?').all(req.params.id);
    res.json({ content, assignments, tests });
  });

  app.post("/api/content/:id/progress", authenticate, (req: any, res) => {
    const { is_viewed } = req.body;
    db.prepare(`
      INSERT INTO content_progress (user_id, content_id, is_viewed) 
      VALUES (?, ?, ?)
      ON CONFLICT(user_id, content_id) DO UPDATE SET is_viewed = excluded.is_viewed, viewed_at = CURRENT_TIMESTAMP
    `).run(req.user.id, req.params.id, is_viewed ? 1 : 0);
    res.json({ success: true });
  });

  // Tests & Questions
  app.post("/api/modules/:id/tests", authenticate, (req: any, res) => {
    if (req.user.role !== 'lecturer' && req.user.role !== 'admin' && req.user.role !== 'sysadmin') return res.status(403).json({ error: "Forbidden" });
    const { title, description, time_limit_minutes, attempt_limit, is_randomized, random_count, passing_score, show_results_immediately } = req.body;
    const result = db.prepare(`
      INSERT INTO tests (module_id, title, description, time_limit_minutes, attempt_limit, is_randomized, random_count, passing_score, show_results_immediately) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(req.params.id, title, description, time_limit_minutes, attempt_limit, is_randomized ? 1 : 0, random_count, passing_score || 0, show_results_immediately ? 1 : 0);
    res.json({ id: result.lastInsertRowid });
  });

  app.get("/api/tests/:id", authenticate, (req, res) => {
    const test = db.prepare('SELECT * FROM tests WHERE id = ?').get(req.params.id);
    if (!test) return res.status(404).json({ error: "Test not found" });
    res.json(test);
  });

  app.get("/api/courses/:id/question-banks", authenticate, (req, res) => {
    const banks = db.prepare('SELECT * FROM question_banks WHERE course_id = ?').all(req.params.id);
    res.json(banks);
  });

  app.post("/api/courses/:id/question-banks", authenticate, (req: any, res) => {
    if (req.user.role !== 'lecturer' && req.user.role !== 'admin' && req.user.role !== 'sysadmin') return res.status(403).json({ error: "Forbidden" });
    const { name, description } = req.body;
    const result = db.prepare('INSERT INTO question_banks (course_id, name, description) VALUES (?, ?, ?)').run(req.params.id, name, description);
    res.json({ id: result.lastInsertRowid });
  });

  app.post("/api/question-banks/:id/questions", authenticate, (req: any, res) => {
    if (req.user.role !== 'lecturer' && req.user.role !== 'admin' && req.user.role !== 'sysadmin') return res.status(403).json({ error: "Forbidden" });
    const { question_text, type, options, correct_answer, points } = req.body;
    const result = db.prepare(`
      INSERT INTO questions (bank_id, question_text, type, options, correct_answer, points) 
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(req.params.id, question_text, type, JSON.stringify(options), correct_answer, points);
    res.json({ id: result.lastInsertRowid });
  });

  app.get("/api/question-banks/:id/questions", authenticate, (req, res) => {
    const questions = db.prepare('SELECT * FROM questions WHERE bank_id = ?').all(req.params.id);
    res.json(questions.map((q: any) => ({ ...q, options: JSON.parse(q.options || '[]') })));
  });

  app.post("/api/tests/:id/questions", authenticate, (req: any, res) => {
    if (req.user.role !== 'lecturer' && req.user.role !== 'admin' && req.user.role !== 'sysadmin') return res.status(403).json({ error: "Forbidden" });
    const { question_text, type, options, correct_answer, points, bank_id } = req.body;
    const result = db.prepare(`
      INSERT INTO questions (test_id, bank_id, question_text, type, options, correct_answer, points) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(req.params.id, bank_id || null, question_text, type, JSON.stringify(options), correct_answer, points);
    res.json({ id: result.lastInsertRowid });
  });

  app.get("/api/tests/:id/questions", authenticate, (req: any, res) => {
    const test = db.prepare('SELECT * FROM tests WHERE id = ?').get(req.params.id) as any;
    if (!test) return res.status(404).json({ error: "Test not found" });

    let questions: any[];
    if (test.is_randomized) {
      // Pull from bank or pool
      questions = db.prepare(`
        SELECT * FROM questions 
        WHERE test_id = ? OR bank_id IN (SELECT bank_id FROM questions WHERE test_id = ?)
        ORDER BY RANDOM() LIMIT ?
      `).all(req.params.id, req.params.id, test.random_count);
    } else {
      questions = db.prepare('SELECT * FROM questions WHERE test_id = ?').all(req.params.id);
    }
    res.json(questions.map((q: any) => ({ ...q, options: JSON.parse(q.options || '[]') })));
  });

  app.post("/api/tests/:id/start", authenticate, (req: any, res) => {
    const test = db.prepare('SELECT * FROM tests WHERE id = ?').get(req.params.id) as any;
    if (!test) return res.status(404).json({ error: "Test not found" });

    // Check for existing in-progress attempt
    const existingAttempt = db.prepare('SELECT * FROM test_results WHERE test_id = ? AND user_id = ? AND status = ?').get(req.params.id, req.user.id, 'in_progress') as any;
    
    if (existingAttempt) {
      // Resume existing attempt
      return res.json({ 
        id: existingAttempt.id,
        resumed: true,
        answers: existingAttempt.answers_json ? JSON.parse(existingAttempt.answers_json) : {},
        time_spent_seconds: existingAttempt.time_spent_seconds || 0
      });
    }

    const attempts = db.prepare('SELECT COUNT(*) as count FROM test_results WHERE test_id = ? AND user_id = ?').get(req.params.id, req.user.id) as { count: number };
    // Ensure attempt_limit is at least 1, handling cases where it might be 0 due to frontend input issues
    const limit = Math.max(1, test.attempt_limit || 1);
    if (attempts.count >= limit) {
      return res.status(403).json({ error: "Attempt limit reached" });
    }

    const result = db.prepare('INSERT INTO test_results (test_id, user_id, status) VALUES (?, ?, ?)').run(req.params.id, req.user.id, 'in_progress');
    res.json({ 
      id: result.lastInsertRowid,
      resumed: false,
      answers: {},
      time_spent_seconds: 0
    });
  });

  app.post("/api/test-results/:id/save", authenticate, (req: any, res) => {
    const { answers, time_spent_seconds } = req.body;
    db.prepare('UPDATE test_results SET answers_json = ?, time_spent_seconds = ? WHERE id = ? AND user_id = ?')
      .run(JSON.stringify(answers), time_spent_seconds, req.params.id, req.user.id);
    res.json({ success: true });
  });

  app.post("/api/test-results/:id/submit", authenticate, (req: any, res) => {
    const { answers, time_spent_seconds } = req.body;
    const result = db.prepare('SELECT * FROM test_results WHERE id = ?').get(req.params.id) as any;
    if (!result) return res.status(404).json({ error: "Result not found" });

    const questions = db.prepare('SELECT * FROM questions WHERE test_id = ?').all(result.test_id) as any[];
    
    let score = 0;
    let needsManualGrading = false;

    questions.forEach(q => {
      const userAnswer = answers[q.id];
      if (q.type === 'multiple_choice' || q.type === 'true_false') {
        if (userAnswer === q.correct_answer) {
          score += q.points;
        }
      } else if (q.type === 'essay' || q.type === 'short_answer') {
        needsManualGrading = true;
      }
    });

    const status = needsManualGrading ? 'submitted' : 'graded';
    db.prepare(`
      UPDATE test_results 
      SET score = ?, status = ?, answers_json = ?, time_spent_seconds = ?, submitted_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `).run(score, status, JSON.stringify(answers), time_spent_seconds, req.params.id);

    res.json({ score, status });
  });

  app.get("/api/test-results/:id", authenticate, (req: any, res) => {
    const attempt = db.prepare(`
      SELECT tr.*, u.full_name, t.title as test_title, t.id as test_id, m.course_id
      FROM test_results tr
      JOIN users u ON tr.user_id = u.id
      JOIN tests t ON tr.test_id = t.id
      JOIN modules m ON t.module_id = m.id
      WHERE tr.id = ?
    `).get(req.params.id) as any;

    if (!attempt) return res.status(404).json({ error: "Attempt not found" });

    // Fetch questions for this test
    const questions = db.prepare(`
      SELECT * FROM questions 
      WHERE test_id = ? OR bank_id IN (SELECT bank_id FROM questions WHERE test_id = ?)
    `).all(attempt.test_id, attempt.test_id);

    const maxScore = questions.reduce((acc: number, q: any) => acc + (q.points || 0), 0);

    res.json({ 
      ...attempt, 
      questions: questions.map((q: any) => ({ ...q, options: JSON.parse(q.options || '[]') })),
      max_score: maxScore,
      scores: attempt.scores_json ? JSON.parse(attempt.scores_json) : {}
    });
  });

  app.post("/api/test-results/:id/grade", authenticate, (req: any, res) => {
    if (req.user.role !== 'lecturer' && req.user.role !== 'admin' && req.user.role !== 'sysadmin') return res.status(403).json({ error: "Forbidden" });
    const { score, scores } = req.body;
    
    if (scores) {
      db.prepare('UPDATE test_results SET score = ?, scores_json = ?, status = ? WHERE id = ?')
        .run(score, JSON.stringify(scores), 'graded', req.params.id);
    } else {
      db.prepare('UPDATE test_results SET score = ?, status = ? WHERE id = ?')
        .run(score, 'graded', req.params.id);
    }
    
    res.json({ success: true });
  });

  app.get("/api/tests/:id/analytics", authenticate, (req: any, res) => {
    if (req.user.role !== 'lecturer' && req.user.role !== 'admin' && req.user.role !== 'sysadmin') return res.status(403).json({ error: "Forbidden" });
    const stats = db.prepare(`
      SELECT 
        COUNT(*) as total_attempts,
        AVG(score) as average_score,
        MAX(score) as max_score,
        MIN(score) as min_score
      FROM test_results 
      WHERE test_id = ? AND status != 'in_progress'
    `).get(req.params.id);
    res.json(stats);
  });

  // Forums & Posts
  app.get("/api/courses/:id/forum", authenticate, (req, res) => {
    let forum = db.prepare('SELECT * FROM forums WHERE course_id = ? AND module_id IS NULL').get(req.params.id) as any;
    if (!forum) {
      const course = db.prepare('SELECT title FROM courses WHERE id = ?').get(req.params.id) as any;
      const result = db.prepare('INSERT INTO forums (course_id, title, description) VALUES (?, ?, ?)')
        .run(req.params.id, `${course.title} General Discussion`, 'General discussion for all students and lecturers in this course.');
      forum = { 
        id: result.lastInsertRowid, 
        course_id: req.params.id, 
        module_id: null, 
        title: `${course.title} General Discussion`,
        description: 'General discussion for all students and lecturers in this course.'
      };
    }
    res.json(forum);
  });

  app.get("/api/modules/:id/forum", authenticate, (req, res) => {
    let forum = db.prepare('SELECT * FROM forums WHERE module_id = ?').get(req.params.id) as any;
    if (!forum) {
      const module = db.prepare(`
        SELECT m.title, m.course_id 
        FROM modules m 
        WHERE m.id = ?
      `).get(req.params.id) as any;
      
      const result = db.prepare('INSERT INTO forums (course_id, module_id, title, description) VALUES (?, ?, ?, ?)')
        .run(module.course_id, req.params.id, `${module.title} Discussion`, `Specific discussion for ${module.title}.`);
      
      forum = { 
        id: result.lastInsertRowid, 
        course_id: module.course_id, 
        module_id: req.params.id, 
        title: `${module.title} Discussion`,
        description: `Specific discussion for ${module.title}.`
      };
    }
    res.json(forum);
  });

  app.get("/api/forums/:id/posts", authenticate, (req, res) => {
    const posts = db.prepare(`
      SELECT p.*, u.full_name, u.role 
      FROM forum_posts p 
      JOIN users u ON p.user_id = u.id 
      WHERE p.forum_id = ? 
      ORDER BY p.is_pinned DESC, p.created_at DESC
    `).all(req.params.id);
    res.json(posts);
  });

  app.post("/api/forums/:id/posts", authenticate, (req: any, res) => {
    const { title, content, parent_id } = req.body;
    const result = db.prepare(`
      INSERT INTO forum_posts (forum_id, user_id, title, content, parent_id) 
      VALUES (?, ?, ?, ?, ?)
    `).run(req.params.id, req.user.id, title, content, parent_id);

    // Notification for replies
    if (parent_id) {
      const parentPost = db.prepare('SELECT user_id FROM forum_posts WHERE id = ?').get(parent_id) as any;
      if (parentPost && parentPost.user_id !== req.user.id) {
        db.prepare(`
          INSERT INTO notifications (user_id, type, content, link) 
          VALUES (?, 'reply', ?, ?)
        `).run(parentPost.user_id, `${req.user.name} replied to your post`, `/forums/post/${parent_id}`);
      }
    }

    res.json({ id: result.lastInsertRowid });
  });

  app.post("/api/posts/:id/pin", authenticate, (req: any, res) => {
    if (req.user.role !== 'lecturer' && req.user.role !== 'admin' && req.user.role !== 'sysadmin') return res.status(403).json({ error: "Forbidden" });
    const { is_pinned } = req.body;
    db.prepare('UPDATE forum_posts SET is_pinned = ? WHERE id = ?').run(is_pinned ? 1 : 0, req.params.id);
    res.json({ success: true });
  });

  app.post("/api/posts/:id/report", authenticate, (req: any, res) => {
    const { reason } = req.body;
    db.prepare('UPDATE forum_posts SET is_reported = 1, report_reason = ? WHERE id = ?').run(reason, req.params.id);
    res.json({ success: true });
  });

  // Notifications
  app.get("/api/notifications", authenticate, (req: any, res) => {
    const notifications = db.prepare('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50').all(req.user.id);
    res.json(notifications);
  });

  app.post("/api/notifications/:id/read", authenticate, (req: any, res) => {
    db.prepare('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
    res.json({ success: true });
  });

  app.patch("/api/users/profile", authenticate, (req: any, res) => {
    const { full_name, bio, avatar_url } = req.body;
    try {
      db.prepare('UPDATE users SET full_name = ?, bio = ?, avatar_url = ? WHERE id = ?')
        .run(full_name || req.user.name, bio || null, avatar_url || null, req.user.id);
      logAction(req.user.id, 'update_profile', 'User updated their profile');
      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ error: err.message || "Update failed" });
    }
  });

  app.post("/api/modules/:id/assignments", authenticate, (req: any, res) => {
    if (req.user.role !== 'lecturer' && req.user.role !== 'admin' && req.user.role !== 'sysadmin') return res.status(403).json({ error: "Forbidden" });
    const { title, description, due_date, allow_late, late_penalty_percent, max_points, rubric_json, min_word_count, allowed_file_types } = req.body;
    const result = db.prepare(`
      INSERT INTO assignments (module_id, title, description, due_date, allow_late, late_penalty_percent, max_points, rubric_json, min_word_count, allowed_file_types) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(req.params.id, title, description, due_date, allow_late ? 1 : 0, late_penalty_percent, max_points, JSON.stringify(rubric_json), min_word_count || 0, allowed_file_types || '*');
    res.json({ id: result.lastInsertRowid });
  });

  app.get("/api/assignments/:id", authenticate, (req, res) => {
    const assignment = db.prepare('SELECT * FROM assignments WHERE id = ?').get(req.params.id) as any;
    if (assignment) {
      assignment.rubric = JSON.parse(assignment.rubric_json || '[]');
    }
    res.json(assignment);
  });

  app.post("/api/assignments/:id/release-grades", authenticate, (req: any, res) => {
    if (req.user.role !== 'lecturer' && req.user.role !== 'admin' && req.user.role !== 'sysadmin') return res.status(403).json({ error: "Forbidden" });
    db.prepare('UPDATE assignments SET grades_released = 1 WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  });

  app.post("/api/assignments/:id/submit", authenticate, (req: any, res) => {
    const { file_url, file_name, text_content, word_count } = req.body;
    const result = db.prepare(`
      INSERT INTO submissions (assignment_id, user_id, file_url, file_name, text_content, word_count) 
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(req.params.id, req.user.id, file_url, file_name, text_content, word_count || 0);
    res.json({ id: result.lastInsertRowid, success: true });
  });

  app.get("/api/assignments/:id/submissions", authenticate, (req: any, res) => {
    if (req.user.role === 'student') {
      const submission = db.prepare('SELECT * FROM submissions WHERE assignment_id = ? AND user_id = ?').get(req.params.id, req.user.id) as any;
      if (submission) {
        submission.rubric_scores = JSON.parse(submission.rubric_scores_json || '{}');
      }
      return res.json(submission ? [submission] : []);
    }
    const submissions = db.prepare(`
      SELECT s.*, u.full_name 
      FROM submissions s 
      JOIN users u ON s.user_id = u.id 
      WHERE s.assignment_id = ?
    `).all(req.params.id);
    res.json(submissions.map((s: any) => ({ ...s, rubric_scores: JSON.parse(s.rubric_scores_json || '{}') })));
  });

  app.post("/api/submissions/:id/grade", authenticate, (req: any, res) => {
    if (req.user.role !== 'lecturer' && req.user.role !== 'admin' && req.user.role !== 'sysadmin') {
      return res.status(403).json({ error: "Forbidden" });
    }
    const { grade, feedback, rubric_scores } = req.body;
    db.prepare('UPDATE submissions SET grade = ?, feedback = ?, rubric_scores_json = ? WHERE id = ?')
      .run(grade, feedback, JSON.stringify(rubric_scores), req.params.id);
    res.json({ success: true });
  });

  app.get("/api/courses/:id/my-grades", authenticate, (req: any, res) => {
    const userId = req.user.id;
    const courseId = req.params.id;

    const assignments = db.prepare(`
      SELECT a.title, s.grade, a.max_points, a.grades_released
      FROM assignments a
      JOIN modules m ON a.module_id = m.id
      LEFT JOIN submissions s ON a.id = s.assignment_id AND s.user_id = ?
      WHERE m.course_id = ?
    `).all(userId, courseId);

    const tests = db.prepare(`
      SELECT t.title, tr.score, 
             (SELECT SUM(points) FROM questions q WHERE q.test_id = t.id) as max_score
      FROM tests t
      JOIN modules m ON t.module_id = m.id
      LEFT JOIN test_results tr ON t.id = tr.test_id AND tr.user_id = ? AND tr.status = 'graded'
      WHERE m.course_id = ?
    `).all(userId, courseId);

    res.json({ assignments, tests });
  });

  // Admin & User Management
  app.get("/api/admin/users", authenticate, (req: any, res) => {
    if (req.user.role !== 'admin' && req.user.role !== 'sysadmin') return res.status(403).json({ error: "Forbidden" });
    const { role } = req.query;
    let query = 'SELECT id, email, full_name, role, status, created_at FROM users';
    let params: any[] = [];
    if (role) {
      query += ' WHERE role = ?';
      params.push(role);
    }
    const users = db.prepare(query).all(...params);
    res.json(users);
  });

  app.post("/api/admin/users/:id/status", authenticate, (req: any, res) => {
    if (req.user.role !== 'admin' && req.user.role !== 'sysadmin') return res.status(403).json({ error: "Forbidden" });
    const { status, payment_status } = req.body;
    if (payment_status) {
      db.prepare('UPDATE users SET status = ?, payment_status = ? WHERE id = ?').run(status, payment_status, req.params.id);
    } else {
      db.prepare('UPDATE users SET status = ? WHERE id = ?').run(status, req.params.id);
    }
    logAction(req.user.id, 'user_status_update', `Updated user ${req.params.id} status to ${status}${payment_status ? ` and payment to ${payment_status}` : ''}`);
    res.json({ success: true });
  });

  app.post("/api/admin/enroll", authenticate, (req: any, res) => {
    if (req.user.role !== 'admin' && req.user.role !== 'sysadmin') return res.status(403).json({ error: "Forbidden" });
    const { userId, courseId } = req.body;
    try {
      db.prepare('INSERT INTO enrollments (user_id, course_id) VALUES (?, ?)').run(userId, courseId);
      logAction(req.user.id, 'manual_enroll', `Manually enrolled user ${userId} in course ${courseId}`);
      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ error: err.message || "Enrollment failed" });
    }
  });

  app.post("/api/admin/courses/:id/assign-lecturer", authenticate, (req: any, res) => {
    if (req.user.role !== 'admin' && req.user.role !== 'sysadmin') return res.status(403).json({ error: "Forbidden" });
    const { userId } = req.body;
    try {
      db.prepare('INSERT INTO course_lecturers (course_id, user_id) VALUES (?, ?)').run(req.params.id, userId);
      logAction(req.user.id, 'assign_lecturer', `Assigned lecturer ${userId} to course ${req.params.id}`);
      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ error: err.message || "Assignment failed" });
    }
  });

  app.get("/api/admin/logs", authenticate, (req: any, res) => {
    if (req.user.role !== 'sysadmin') return res.status(403).json({ error: "Forbidden" });
    const logs = db.prepare(`
      SELECT l.*, u.full_name as user_name 
      FROM logs l 
      LEFT JOIN users u ON l.user_id = u.id 
      ORDER BY l.created_at DESC LIMIT 100
    `).all();
    res.json(logs);
  });

  // Admin Reporting
  app.get("/api/admin/stats", authenticate, (req: any, res) => {
    if (req.user.role !== 'admin' && req.user.role !== 'sysadmin') {
      return res.status(403).json({ error: "Forbidden" });
    }
    const stats = {
      users: db.prepare('SELECT COUNT(*) as count FROM users').get(),
      courses: db.prepare('SELECT COUNT(*) as count FROM courses').get(),
      enrollments: db.prepare('SELECT COUNT(*) as count FROM enrollments').get(),
      submissions: db.prepare('SELECT COUNT(*) as count FROM submissions').get(),
      pendingApprovals: db.prepare("SELECT COUNT(*) as count FROM users WHERE status = 'pending'").get(),
      unpaidUsers: db.prepare("SELECT COUNT(*) as count FROM users WHERE payment_status = 'unpaid' AND role = 'student'").get(),
      activeStudents: db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'student' AND status = 'active'").get(),
      activeLecturers: db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'lecturer' AND status = 'active'").get(),
      recentLogs: db.prepare(`
        SELECT l.*, u.full_name as user_name 
        FROM logs l 
        LEFT JOIN users u ON l.user_id = u.id 
        ORDER BY l.created_at DESC 
        LIMIT 10
      `).all(),
      recentUsers: db.prepare("SELECT * FROM users ORDER BY created_at DESC LIMIT 8").all(),
      popularCourses: db.prepare(`
        SELECT c.title, c.code, COUNT(e.id) as student_count
        FROM courses c
        LEFT JOIN enrollments e ON c.id = e.course_id
        GROUP BY c.id
        ORDER BY student_count DESC
        LIMIT 5
      `).all()
    };
    res.json(stats);
  });

  app.get("/api/admin/all-submissions", authenticate, (req: any, res) => {
    if (req.user.role !== 'admin' && req.user.role !== 'sysadmin') {
      return res.status(403).json({ error: "Forbidden" });
    }
    const assignmentSubmissions = db.prepare(`
      SELECT s.*, u.full_name as student_name, a.title as assignment_title, c.title as course_title
      FROM submissions s
      JOIN users u ON s.user_id = u.id
      JOIN assignments a ON s.assignment_id = a.id
      JOIN modules m ON a.module_id = m.id
      JOIN courses c ON m.course_id = c.id
      ORDER BY s.submitted_at DESC
    `).all();

    const testResults = db.prepare(`
      SELECT tr.*, u.full_name as student_name, t.title as test_title, c.title as course_title
      FROM test_results tr
      JOIN users u ON tr.user_id = u.id
      JOIN tests t ON tr.test_id = t.id
      JOIN modules m ON t.module_id = m.id
      JOIN courses c ON m.course_id = c.id
      ORDER BY tr.started_at DESC
    `).all();

    res.json({ assignmentSubmissions, testResults });
  });

  app.post("/api/admin/users/create", authenticate, (req: any, res) => {
    if (req.user.role !== 'admin' && req.user.role !== 'sysadmin') return res.status(403).json({ error: "Forbidden" });
    const { email, password, full_name, role, phone_number } = req.body;
    
    try {
      const existingUser = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
      if (existingUser) return res.status(400).json({ error: "User with this email already exists" });

      const result = db.prepare('INSERT INTO users (email, password, full_name, role, status, phone_number) VALUES (?, ?, ?, ?, ?, ?)').run(email, password, full_name, role, 'active', phone_number);
      logAction(req.user.id, 'create_user', `Created user ${full_name} (${role})`);
      res.json({ success: true, id: result.lastInsertRowid });
    } catch (err: any) {
      res.status(400).json({ error: err.message || "User creation failed" });
    }
  });

  app.get("/api/admin/users/:id/details", authenticate, (req: any, res) => {
    if (req.user.role !== 'admin' && req.user.role !== 'sysadmin') {
      return res.status(403).json({ error: "Forbidden" });
    }
    const user = db.prepare('SELECT id, email, full_name, role, status, bio, created_at FROM users WHERE id = ?').get(req.params.id) as any;
    if (!user) return res.status(404).json({ error: "User not found" });

    const enrollments = db.prepare(`
      SELECT e.*, c.title as course_title, c.code as course_code
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      WHERE e.user_id = ?
    `).all(req.params.id);

    const submissions = db.prepare(`
      SELECT s.*, a.title as assignment_title, c.title as course_title
      FROM submissions s
      JOIN assignments a ON s.assignment_id = a.id
      JOIN modules m ON a.module_id = m.id
      JOIN courses c ON m.course_id = c.id
      WHERE s.user_id = ?
    `).all(req.params.id);

    res.json({ user, enrollments, submissions });
  });

  app.get("/api/admin/reports/engagement", authenticate, (req: any, res) => {
    if (req.user.role !== 'admin' && req.user.role !== 'sysadmin') return res.status(403).json({ error: "Forbidden" });
    const data = db.prepare(`
      SELECT u.id, u.full_name, 
             (SELECT COUNT(*) FROM content_progress cp WHERE cp.user_id = u.id AND cp.is_viewed = 1) as viewed_content,
             (SELECT COUNT(*) FROM forum_posts fp WHERE fp.user_id = u.id) as forum_posts,
             (SELECT COUNT(*) FROM submissions s WHERE s.user_id = u.id) as submissions
      FROM users u
      WHERE u.role = 'student'
      ORDER BY (viewed_content + forum_posts + submissions) DESC
    `).all();
    res.json(data);
  });

  app.get("/api/admin/reports/completion", authenticate, (req: any, res) => {
    if (req.user.role !== 'admin' && req.user.role !== 'sysadmin') return res.status(403).json({ error: "Forbidden" });
    const data = db.prepare(`
      SELECT c.id, c.title, c.code,
             COUNT(e.id) as total_enrolled,
             SUM(CASE WHEN e.status = 'completed' THEN 1 ELSE 0 END) as completed_count
      FROM courses c
      LEFT JOIN enrollments e ON c.id = e.course_id
      GROUP BY c.id
    `).all();
    res.json(data);
  });

  app.get("/api/admin/reports/performance", authenticate, (req: any, res) => {
    if (req.user.role !== 'admin' && req.user.role !== 'sysadmin') return res.status(403).json({ error: "Forbidden" });
    const data = db.prepare(`
      SELECT c.id, c.title, c.code,
             AVG(s.grade) as avg_assignment_grade,
             AVG(tr.score) as avg_test_score
      FROM courses c
      LEFT JOIN modules m ON c.id = m.course_id
      LEFT JOIN assignments a ON m.id = a.module_id
      LEFT JOIN submissions s ON a.id = s.assignment_id
      LEFT JOIN tests t ON m.id = t.module_id
      LEFT JOIN test_results tr ON t.id = tr.test_id
      GROUP BY c.id
    `).all();
    res.json(data);
  });

  app.get("/api/admin/reports/drop-off", authenticate, (req: any, res) => {
    if (req.user.role !== 'admin' && req.user.role !== 'sysadmin') return res.status(403).json({ error: "Forbidden" });
    const data = db.prepare(`
      SELECT c.id, c.title, c.code,
             COUNT(e.id) as total_enrolled,
             SUM(CASE WHEN e.status = 'dropped' THEN 1 ELSE 0 END) as dropped_count
      FROM courses c
      LEFT JOIN enrollments e ON c.id = e.course_id
      GROUP BY c.id
    `).all();
    res.json(data);
  });

  app.get("/api/admin/reports/lecturer-activity", authenticate, (req: any, res) => {
    if (req.user.role !== 'admin' && req.user.role !== 'sysadmin') return res.status(403).json({ error: "Forbidden" });
    const data = db.prepare(`
      SELECT u.id, u.full_name,
             (SELECT COUNT(*) FROM courses c WHERE c.lecturer_id = u.id) as courses_count,
             (SELECT COUNT(*) FROM forum_posts fp WHERE fp.user_id = u.id) as forum_posts,
             (SELECT COUNT(*) FROM submissions s 
              JOIN assignments a ON s.assignment_id = a.id 
              JOIN modules m ON a.module_id = m.id 
              JOIN courses c ON m.course_id = c.id 
              WHERE c.lecturer_id = u.id AND s.grade IS NOT NULL) as graded_count
      FROM users u
      WHERE u.role = 'lecturer'
    `).all();
    res.json(data);
  });

  app.get("/api/admin/all-courses", authenticate, (req: any, res) => {
    if (req.user.role !== 'admin' && req.user.role !== 'sysadmin') {
      return res.status(403).json({ error: "Forbidden" });
    }
    const courses = db.prepare(`
      SELECT c.*, u.full_name as lecturer_name,
             (SELECT COUNT(*) FROM enrollments e WHERE e.course_id = c.id) as student_count
      FROM courses c
      LEFT JOIN users u ON c.lecturer_id = u.id
      ORDER BY c.title ASC
    `).all();
    res.json(courses);
  });

  // 404 handler for API routes
  app.all("/api/*", (req, res) => {
    res.status(404).json({ error: `Route ${req.method} ${req.url} not found` });
  });

  // Global error handler
  app.use((err: any, req: any, res: any, next: any) => {
    console.error(err.stack);
    res.status(500).json({ error: "Internal Server Error" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
    app.get("*", (req, res) => {
      res.sendFile(path.resolve("dist/index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
