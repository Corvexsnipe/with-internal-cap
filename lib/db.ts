import mysql from 'mysql2/promise';
import nodemailer from 'nodemailer';

const pool = mysql.createPool({
  uri: process.env.DATABASE_URL || 'mysql://mysql:3Qed32td8bS5Jw1G12v9Ydrpd4sCriNb4GFROuueQ2SneGqVA48KFnxwBtUk7XjG@edkiolselorf4b4ohoocpjaf:3306/default',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.zeptomail.in',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER || 'emailapikey',
    pass: process.env.EMAIL_PASS,
  },
});

export async function initializeDatabase() {
  try {
    const connection = await pool.getConnection();
    console.log('Database connection established');

    // Create staff_applications table if not exists
    await connection.query(`
      CREATE TABLE IF NOT EXISTS staff_applications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('staff_applications table checked/created');

    // Check if application_id column exists, add if not
    const [columns] = await connection.query(`
      SHOW COLUMNS FROM staff_applications LIKE 'application_id'
    `);

    if ((columns as any[]).length === 0) {
      // Add column as nullable first
      await connection.query(`
        ALTER TABLE staff_applications
        ADD COLUMN application_id VARCHAR(20) NULL AFTER id
      `);

      // Update existing rows with application IDs
      await connection.query(`
        UPDATE staff_applications
        SET application_id = CONCAT('CAS-', LPAD(id, 6, '0'))
        WHERE application_id IS NULL
      `);

      // Now make it NOT NULL and UNIQUE
      await connection.query(`
        ALTER TABLE staff_applications
        MODIFY COLUMN application_id VARCHAR(20) NOT NULL,
        ADD UNIQUE INDEX (application_id)
      `);

      console.log('Added application_id column to staff_applications table');
    }

    // Create customer_support_applications table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS customer_support_applications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        application_id VARCHAR(20) NOT NULL UNIQUE,
        full_name VARCHAR(255) NOT NULL,
        age INT NOT NULL,
        country VARCHAR(100) NOT NULL,
        city VARCHAR(100) NOT NULL,
        email VARCHAR(255) NOT NULL,
        contact_number VARCHAR(20) NOT NULL,
        discord_username VARCHAR(100),
        languages TEXT NOT NULL,
        previous_experience TEXT,
        has_hosting_experience BOOLEAN DEFAULT FALSE,
        hosting_experience_details TEXT,
        experience_letter_path VARCHAR(255),
        daily_hours INT NOT NULL,
        weekend_availability BOOLEAN DEFAULT FALSE,
        emergency_availability BOOLEAN DEFAULT FALSE,
        handle_angry_customer TEXT NOT NULL,
        handle_unknown_solution TEXT NOT NULL,
        prioritize_multiple_customers TEXT NOT NULL,
        explain_technical_issue TEXT NOT NULL,
        minecraft_server_check TEXT NOT NULL,
        expected_salary VARCHAR(50) NOT NULL,
        identity_card_path VARCHAR(255),
        passport_photo_path VARCHAR(255),
        why_hire TEXT NOT NULL,
        agree_to_rules BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('customer_support_applications table checked/created');

    // Create sales_applications table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS sales_applications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        application_id VARCHAR(20) NOT NULL UNIQUE,
        full_name VARCHAR(255) NOT NULL,
        age INT NOT NULL,
        country VARCHAR(100) NOT NULL,
        city VARCHAR(100) NOT NULL,
        email VARCHAR(255) NOT NULL,
        contact_number VARCHAR(20) NOT NULL,
        discord_username VARCHAR(100) NOT NULL,
        languages TEXT NOT NULL,
        previous_experience TEXT NOT NULL,
        hosting_experience TEXT NOT NULL,
        experience_letter_path VARCHAR(255),
        daily_hours VARCHAR(50) NOT NULL,
        weekend_availability BOOLEAN DEFAULT FALSE,
        emergency_availability BOOLEAN DEFAULT FALSE,
        expected_salary VARCHAR(50) NOT NULL,
        convince_customer TEXT NOT NULL,
        expensive_response TEXT NOT NULL,
        minecraft_server_info TEXT NOT NULL,
        ram_cpu_difference TEXT NOT NULL,
        lag_diagnosis TEXT NOT NULL,
        identity_card_path VARCHAR(255),
        passport_photo_path VARCHAR(255),
        why_hire TEXT NOT NULL,
        agree_to_rules BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('sales_applications table checked/created');

    connection.release();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

export function generateApplicationId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `CAS-${timestamp}-${random}`.toUpperCase();
}

export async function sendStaffApplicationEmail(name: string, email: string, message: string) {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'work@caspianhost.com',
      to: process.env.ADMIN_EMAIL || 'caspiannode@gmail.com',
      subject: 'New Staff Application Received',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333;">New Staff Application</h2>
          <p style="color: #666;">A new staff application has been submitted:</p>

          <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Message:</strong></p>
            <p style="white-space: pre-wrap; color: #555;">${message}</p>
          </div>

          <p style="color: #999; font-size: 12px;">This is an automated email from Caspian Host Staff Application Form.</p>
        </div>
      `,
    });
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

export async function sendCustomerSupportApplicationEmail(fullName: string, email: string, applicationId: string) {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'work@caspianhost.com',
      to: email,
      subject: 'Your Customer Support Application Received - Caspian Host',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #0a0a0a;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #00d4ff; font-size: 32px; margin: 0;">Caspian Host</h1>
            <p style="color: #888; font-size: 14px; margin: 5px 0 0 0;">Premium Game Hosting</p>
          </div>

          <div style="background: #1a1a1a; padding: 30px; border-radius: 10px; border: 1px solid #333;">
            <h2 style="color: #fff; margin-top: 0;">Application Received!</h2>
            <p style="color: #ccc; line-height: 1.6;">
              Thank you for applying to join the Caspian Host Customer Support team. We have received your application and will review it shortly.
            </p>

            <div style="background: #0f0f0f; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #00d4ff;">
              <p style="color: #888; font-size: 14px; margin: 0 0 5px 0;">Your Application ID:</p>
              <p style="color: #00d4ff; font-size: 24px; font-weight: bold; margin: 0; letter-spacing: 1px;">${applicationId}</p>
            </div>

            <p style="color: #ccc; line-height: 1.6;">
              Please save this Application ID for future reference. Our team will contact you via email if your application progresses to the next stage.
            </p>

            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #333;">
              <p style="color: #888; font-size: 14px; margin: 0;">
                If you have any questions, feel free to contact us at <a href="mailto:support@caspianhost.com" style="color: #00d4ff;">support@caspianhost.com</a>
              </p>
            </div>
          </div>

          <div style="text-align: center; margin-top: 30px; color: #666; font-size: 12px;">
            <p style="margin: 0;">This is an automated email. Please do not reply.</p>
            <p style="margin: 5px 0 0 0;">© ${new Date().getFullYear()} Caspian Host. All rights reserved.</p>
          </div>
        </div>
      `,
    });
    console.log('Customer support application email sent successfully to:', email);
  } catch (error) {
    console.error('Error sending customer support application email:', error);
  }
}

export default pool;
