
# 🌟 **GOVARDHAN DAIRY FARM**  
*(Currently Working)*  

Welcome to **Govardhan Dairy Farm**! 🚜🥛 This is an advanced e-commerce platform designed to manage and sell high-quality dairy products. The project is structured into three main parts:  
📂 **Admin** | 🎨 **Frontend** | 🔧 **Backend**

---

## 🏗️ **Project Structure**  
1. **Admin**: 👩‍💼 Manages administrative functionalities.  
2. **Frontend**: 🌐 User-facing interface for customers.  
3. **Backend**: 🛠️ Handles server-side logic, database management, and APIs.  

---

## 🚀 **Installation Guide**  
Follow these steps to set up the project on your local machine:

### 1️⃣ **Clone the Repository**  
```bash
git clone https://github.com/rahulrc1525/GovardhanDairyFarm.git
cd GDF
```

---

### 2️⃣ **Backend Setup**  
1. Navigate to the **Backend** folder:  
   ```bash
   cd Backend
   ```  
2. Install dependencies:  
   ```bash
   npm install
   ```  

#### 🛠️ **Backend Dependencies**  
| 📦 Package         | 🔍 Purpose                                                | ⚙️ Command                    |
|---------------------|-----------------------------------------------------------|--------------------------------|
| **express**         | For building web applications and APIs.                   | `npm install express`          |
| **jsonwebtoken**    | For generating and verifying JWT tokens.                  | `npm install jsonwebtoken`     |
| **bcryptjs**        | For hashing and comparing passwords.                      | `npm install bcryptjs`         |
| **dotenv**          | For managing environment variables securely.              | `npm install dotenv`           |
| **mongoose**        | For connecting and interacting with MongoDB.              | `npm install mongoose`         |
| **body-parser**     | To parse incoming request bodies.                         | `npm install body-parser`      |
| **cors**            | For enabling Cross-Origin Resource Sharing.               | `npm install cors`             |
| **nodemon**         | Dev tool to auto-restart the server on file changes.       | `npm install nodemon`          |
| **eslint**          | Dev tool for identifying and fixing linting issues.       | `npm install eslint`           |
| **prettier**        | Dev tool for consistent code formatting.                  | `npm install prettier`         |

💡 **Run the Backend Server**:  
```bash
npm run server
```

---

### 3️⃣ **Frontend Setup**  
1. Navigate to the **Frontend** folder:  
   ```bash
   cd ../Frontend
   ```  
2. Install dependencies:  
   ```bash
   npm install
   ```  

#### 🖼️ **Frontend Dependencies**  
| 📦 Package                    | 🔍 Purpose                                       | ⚙️ Command                               |
|--------------------------------|-------------------------------------------------|-----------------------------------------|
| **axios**                      | For making HTTP requests to the backend.        | `npm install axios`                     |
| **jwt-decode**                 | For decoding JWT tokens on the client side.     | `npm install jwt-decode`                |
| **react-router-dom**           | For implementing routing and navigation.        | `npm install react-router-dom`          |
| **@reduxjs/toolkit react-redux** | For managing application state using Redux.     | `npm install @reduxjs/toolkit react-redux` |

💡 **Run the Frontend**:  
```bash
npm run start
```

---

### 4️⃣ **Admin Setup**  
1. Navigate to the **Admin** folder:  
   ```bash
   cd ../Admin
   ```  
2. Install dependencies:  
   ```bash
   npm install
   ```  

💡 **Run the Admin Panel**:  
```bash
npm run dev
```

---

## ⚠️ **Note**
- 🔧 **Update MongoDB URL**: Make sure to update the MongoDB connection URL in the `.env` file located in the **Backend** folder.  

---

## 🎯 **Usage**  
- **Backend**: Run the server with:  
   ```bash
   npm run server
   ```  
- **Frontend**: Start the client interface with:  
   ```bash
   npm run start
   ```  
- **Admin**: Launch the admin panel with:  
   ```bash
   npm run dev
   ```  

---

## 🤝 **Contributing**  
Contributions are welcome! 📝  
1. Fork the repository.  
2. Create a new branch.  
3. Commit your changes.  
4. Create a pull request.  

---


Let me know if you need further customizations! 😊
