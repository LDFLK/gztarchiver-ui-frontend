## Getting Started

### Installation & Setup

#### Prerequisite

- Node V20+
- Git

1. **Fork & Clone the Repository**

```bash
git clone https://github.com/your-username/gztarchiver-ui-frontend.git
cd gztarchiver-ui-frontend
```

2. **Install Dependencies**

```bash
npm install
```

3. **Configuration**

Create a `config.js` file in the `public` directory
```bash
window.configs = {
  apiUrl: '<ARCHIVES_BACKEND_URL>',
  baseUrlForDocumentAccess: 'https://github.com/LDFLK/gztarchiver-storage/blob/main'
};

```

4. **Run the Application (development)**

##### Using Terminal

```bash
npm run dev
```

The application will be available at: `http://localhost:5173`

After, add this url on the .env file of the [Archives Backend](https://github.com/LDFLK/gztarchiver-ui-backend) under LOCAL_CORS
```bash
LOCAL_CORS="http://localhost:5173"
```