export const materialsContentBySubModule: Record<number, any> = {
  // ─────────────────────────────────────────
  // 📘 Material 1: What is Python?
  // ─────────────────────────────────────────
  1: {
    id: 1,
    title: "What is Python?",
    progress: 100,
    blocks: [
      {
        id: "block-1",
        orderNumber: 1,
        contents: [
          {
            id: "c1",
            type: "heading",
            level: 1,
            text: "What is Python?",
          },
          {
            id: "c2",
            type: "paragraph",
            text: "Python is a high-level, interpreted programming language that focuses on readability and simplicity. It allows developers to write clean and logical code for both small and large-scale projects. Python is often recommended for beginners because its syntax resembles natural language.",
          },
          {
            id: "c3",
            type: "paragraph",
            text: "Over the years, Python has become one of the most popular programming languages in the world. It is used in web development, data science, artificial intelligence, automation, and many other fields.",
          },
          {
            id: "c4",
            type: "highlight",
            text: "Python's simplicity does not limit its power—it is used by companies like Google, Netflix, and NASA.",
          },
          {
            id: "c5",
            type: "accordion",
            title: "Why Python is So Popular?",
            description:
              "Click each section to explore the reasons behind Python's popularity",
            items: [
              {
                title: "Easy to Learn",
                content:
                  "Python uses a clean and readable syntax, making it easier for beginners to understand programming concepts without being overwhelmed by complex syntax.",
              },
              {
                title: "Huge Ecosystem",
                content:
                  "Python has thousands of libraries like NumPy, Pandas, TensorFlow, and Django that make development faster and easier.",
              },
              {
                title: "Cross Platform",
                content:
                  "Python works on Windows, Mac, and Linux without requiring major changes to your code.",
              },
            ],
          },
          {
            id: "c6",
            type: "carousel",
            title: "Where Python is Used",
            description:
              "Swipe to see the various industries and domains where Python is a primary language.",
            cardsPerSlide: 2,
            items: [
              {
                title: "Web Development",
                content: "Frameworks like Django and Flask are widely used.",
              },
              {
                title: "Data Science",
                content: "Python dominates data analysis and visualization.",
              },
              {
                title: "Machine Learning",
                content: "Used in AI with libraries like TensorFlow.",
              },
              {
                title: "Automation",
                content: "Automate repetitive tasks efficiently.",
              },
            ],
          },
          {
            id: "c7",
            type: "summary",
            comments: [
              "Python is beginner-friendly and powerful",
              "Used in many industries and technologies",
              "Large community and ecosystem",
            ],
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────
  // 💻 Material 2: Installing Python & VS Code
  // ─────────────────────────────────────────
  2: {
    id: 2,
    title: "Installing Python & VS Code",
    progress: 70,
    blocks: [
      {
        id: "block-1",
        orderNumber: 1,
        contents: [
          {
            id: "c1",
            type: "heading",
            level: 2,
            text: "Installing Python & VS Code",
          },
          {
            id: "c2",
            type: "paragraph",
            text: "Before writing Python code, you need to install Python and a code editor. Python can be downloaded from the official website, while Visual Studio Code (VS Code) is one of the most popular editors used by developers.",
          },
          {
            id: "c3",
            type: "tab_navigation",
            title: "Installation Guide",
            description:
              "Select the tab that corresponds to your computer's operating system for specific instructions.",
            tabs: [
              {
                title: "Windows",
                content:
                  "Download Python installer and make sure to check 'Add Python to PATH' during installation.",
              },
              {
                title: "Mac",
                content:
                  "Install Python using Homebrew or download from python.org.",
              },
              {
                title: "Linux",
                content:
                  "Use package manager like apt or yum to install Python easily.",
              },
            ],
          },
          {
            id: "c4",
            type: "content_card",
            title: "VS Code Setup",
            description:
              "Follow these essential steps to turn VS Code into a powerful Python development environment.",
            disableExpandableContent: false,
            items: [
              {
                title: "Install VS Code",
                content: "Download from official website",
                expandableContent:
                  "VS Code is lightweight but powerful with extensions support.",
              },
              {
                title: "Install Python Extension",
                content: "Search in extension marketplace",
                expandableContent:
                  "Python extension provides IntelliSense, linting, and debugging.",
              },
              {
                title: "Configure Interpreter",
                content: "Select Python version",
                expandableContent:
                  "Ensures your code runs using the correct Python environment.",
              },
            ],
          },
          {
            id: "c5",
            type: "highlight",
            text: "Always verify installation by running 'python --version' in your terminal.",
          },
          {
            id: "c6",
            type: "summary",
            comments: [
              "Install Python from official source",
              "Use VS Code as your editor",
              "Setup extensions for better experience",
            ],
          },
        ],
        additionalContents: [
          {
            id: "a1",
            type: "image_video",
            position: "after",
            content: {
              id: "img1",
              url: "https://images.unsplash.com/photo-1519389950473-47ba0277781c",
              caption: "Setting up development environment",
            },
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────
  // 🧪 Material 3: Your First Python Program
  // ─────────────────────────────────────────
  3: {
    id: 3,
    title: "Your First Python Program",
    progress: 20,
    blocks: [
      {
        id: "block-1",
        orderNumber: 1,
        contents: [
          {
            id: "c1",
            type: "heading",
            level: 2,
            text: "Your First Python Program",
          },
          {
            id: "c2",
            type: "paragraph",
            text: "Now that you have installed Python, it's time to write your first program. The most common beginner program is 'Hello World', which prints a message to the screen.",
          },
          {
            id: "c3",
            type: "paragraph",
            text: "In Python, you use the print() function to display output. This function is very important and will be used frequently in your coding journey.",
          },
          {
            id: "c4",
            type: "carousel",
            title: "Basic Concepts",
            description:
              "Here are the fundamental building blocks you will encounter in your first program.",
            cardsPerSlide: 2,
            items: [
              {
                title: "print()",
                content: "Displays output to the console.",
              },
              {
                title: "Variables",
                content: "Store values for later use.",
              },
              {
                title: "Strings",
                content: "Text data wrapped in quotes.",
              },
              {
                title: "Numbers",
                content: "Integers and floats.",
              },
            ],
          },
          {
            id: "c5",
            type: "accordion",
            title: "Understanding print()",
            description:
              "Learn how the print function can be used in different ways to show data.",
            items: [
              {
                title: "Basic Usage",
                content: "print('Hello World') will display text.",
              },
              {
                title: "Multiple Values",
                content: "print('Hello', 'World') prints multiple values.",
              },
              {
                title: "Formatting",
                content: "You can format output using f-strings.",
              },
            ],
          },
          {
            id: "c6",
            type: "summary",
            comments: [
              "print() is used to display output",
              "Python syntax is simple",
              "Practice by modifying code",
            ],
          },
        ],
        additionalContents: [
          {
            id: "a1",
            type: "interactive_code",
            position: "after",
            content: {
              id: "code1",
              language: "python",
              initialCode: `print("Hello, World!")`,
              expectedResult: "Hello, World!",
            },
          },
          {
            id: "a2",
            type: "multiple_choice",
            position: "after",
            content: {
              id: "quiz1",
              question: "What does print() do in Python?",
              description:
                "Select the most accurate description of the function's purpose.",
              options: [
                { id: "o1", text: "Takes input from user" },
                { id: "o2", text: "Displays output to screen" },
                { id: "o3", text: "Deletes variables" },
              ],
              correctAnswers: ["o2"],
              explanation: "print() is used to display output.",
            },
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────
  // 📦 Material 4: Lists & Tuples
  // ─────────────────────────────────────────
  4: {
    id: 4,
    title: "Lists & Tuples",
    progress: 100,
    blocks: [
      {
        id: "block-1",
        orderNumber: 1,
        contents: [
          {
            id: "c1",
            type: "heading",
            level: 2,
            text: "Lists & Tuples in Python",
          },
          {
            id: "c2",
            type: "paragraph",
            text: "Lists and tuples are two of the most commonly used data structures in Python. They allow you to store multiple values in a single variable, making your code more efficient and organized.",
          },
          {
            id: "c3",
            type: "paragraph",
            text: "A list is mutable, meaning you can change its content after creation. On the other hand, a tuple is immutable, meaning once it is created, its content cannot be changed. This difference makes tuples faster and safer for fixed data.",
          },
          {
            id: "c4",
            type: "highlight",
            text: "Lists are flexible and changeable, while tuples are fixed and faster.",
          },
          {
            id: "c5",
            type: "accordion",
            title: "Key Differences",
            description:
              "A side-by-side comparison of mutability, syntax, and performance between lists and tuples.",
            items: [
              {
                title: "Mutability",
                content: "Lists can be modified, tuples cannot.",
              },
              {
                title: "Syntax",
                content: "Lists use [], tuples use ().",
              },
              {
                title: "Performance",
                content: "Tuples are slightly faster due to immutability.",
              },
            ],
          },
          {
            id: "c6",
            type: "carousel",
            title: "Examples",
            description:
              "Practical code snippets showing how to declare and manipulate these structures.",
            cardsPerSlide: 2,
            items: [
              {
                title: "List Example",
                content: "my_list = [1, 2, 3]",
              },
              {
                title: "Tuple Example",
                content: "my_tuple = (1, 2, 3)",
              },
              {
                title: "Modify List",
                content: "my_list[0] = 10",
              },
              {
                title: "Tuple Error",
                content: "my_tuple[0] = 10 ❌",
              },
            ],
          },
          {
            id: "c7",
            type: "summary",
            comments: [
              "Lists are mutable",
              "Tuples are immutable",
              "Both store multiple values",
            ],
          },
        ],
        additionalContents: [
          {
            id: "a1",
            type: "interactive_code",
            position: "after",
            content: {
              id: "code1",
              language: "python",
              initialCode: `my_list = [1, 2, 3]\nmy_list.append(4)\nprint(my_list)`,
              expectedResult: "[1, 2, 3, 4]",
            },
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────
  // 📚 Material 5: Dictionaries & Sets
  // ─────────────────────────────────────────
  5: {
    id: 5,
    title: "Dictionaries & Sets",
    progress: 100,
    blocks: [
      {
        id: "block-1",
        orderNumber: 1,
        contents: [
          {
            id: "c1",
            type: "heading",
            level: 2,
            text: "Dictionaries & Sets",
          },
          {
            id: "c2",
            type: "paragraph",
            text: "Dictionaries store data in key-value pairs, allowing you to access values quickly using keys. Sets, on the other hand, are unordered collections that do not allow duplicate values.",
          },
          {
            id: "c3",
            type: "paragraph",
            text: "Dictionaries are useful when you need structured data, such as user profiles. Sets are useful for removing duplicates or performing mathematical set operations like union and intersection.",
          },
          {
            id: "c4",
            type: "highlight",
            text: "Dictionaries use key-value pairs, while sets ensure uniqueness of data.",
          },
          {
            id: "c5",
            type: "content_card",
            title: "Use Cases",
            description:
              "Explore when to use Dictionaries versus Sets based on your data needs.",
            disableExpandableContent: false,
            items: [
              {
                title: "Dictionary",
                content: "Store structured data",
                expandableContent: "Example: {'name': 'John', 'age': 25}",
              },
              {
                title: "Set",
                content: "Remove duplicates",
                expandableContent: "Example: {1,2,3}",
              },
            ],
          },
          {
            id: "c6",
            type: "tab_navigation",
            title: "Comparison",
            description:
              "Quick comparison of the structural logic between keys/values and unique unordered elements.",
            tabs: [
              {
                title: "Dictionary",
                content: "Key-value structure",
              },
              {
                title: "Set",
                content: "Unique unordered values",
              },
            ],
          },
          {
            id: "c7",
            type: "summary",
            comments: [
              "Dictionary = key-value",
              "Set = unique values",
              "Useful for data processing",
            ],
          },
        ],
        additionalContents: [
          {
            id: "a1",
            type: "matching",
            position: "after",
            content: {
              id: "match1",
              question: "Match data structure with description",
              description:
                "Connect the correct concept to its primary characteristic.",
              leftItems: [
                { id: "l1", text: "Dictionary" },
                { id: "l2", text: "Set" },
              ],
              rightItems: [
                { id: "r1", text: "Key-value pairs" },
                { id: "r2", text: "Unique values only" },
              ],
              correctPairs: [
                { leftId: "l1", rightId: "r1" },
                { leftId: "l2", rightId: "r2" },
              ],
            },
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────
  // ⚡ Material 6: Comprehensions
  // ─────────────────────────────────────────
  6: {
    id: 6,
    title: "Comprehensions",
    progress: 40,
    blocks: [
      {
        id: "block-1",
        orderNumber: 1,
        contents: [
          {
            id: "c1",
            type: "heading",
            level: 2,
            text: "List Comprehensions",
          },
          {
            id: "c2",
            type: "paragraph",
            text: "Comprehensions provide a concise way to create lists, dictionaries, and sets in Python. They make your code shorter and more readable compared to traditional loops.",
          },
          {
            id: "c3",
            type: "paragraph",
            text: "Instead of writing multiple lines using loops, you can generate a new list in a single line using comprehension syntax.",
          },
          {
            id: "c4",
            type: "highlight",
            text: "Comprehensions make code shorter, cleaner, and more Pythonic.",
          },
          {
            id: "c5",
            type: "accordion",
            title: "Types of Comprehensions",
            description:
              "Python supports comprehensions for various collection types.",
            items: [
              {
                title: "List",
                content: "[x for x in range(5)]",
              },
              {
                title: "Dictionary",
                content: "{x: x*x for x in range(5)}",
              },
              {
                title: "Set",
                content: "{x for x in range(5)}",
              },
            ],
          },
          {
            id: "c6",
            type: "carousel",
            title: "Examples",
            description:
              "See how logic like multiplication and filtering can be applied inside a comprehension.",
            cardsPerSlide: 2,
            items: [
              {
                title: "Square Numbers",
                content: "[x*x for x in range(5)]",
              },
              {
                title: "Even Numbers",
                content: "[x for x in range(10) if x % 2 == 0]",
              },
            ],
          },
          {
            id: "c7",
            type: "summary",
            comments: [
              "Shorter syntax",
              "More readable",
              "Common in Python code",
            ],
          },
        ],
        additionalContents: [
          {
            id: "a1",
            type: "interactive_code",
            position: "after",
            content: {
              id: "code1",
              language: "python",
              initialCode: `squares = [x*x for x in range(5)]\nprint(squares)`,
              expectedResult: "[0, 1, 4, 9, 16]",
            },
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────
  // 🧩 Material 7: Nested Data Structures
  // ─────────────────────────────────────────
  7: {
    id: 7,
    title: "Nested Data Structures",
    progress: 100,
    blocks: [
      {
        id: "block-1",
        orderNumber: 1,
        contents: [
          {
            id: "c1",
            type: "heading",
            level: 2,
            text: "Nested Data Structures",
          },
          {
            id: "c2",
            type: "paragraph",
            text: "Nested data structures are structures within structures, such as a list inside a dictionary or a dictionary inside a list. They are powerful for representing complex data.",
          },
          {
            id: "c3",
            type: "paragraph",
            text: "For example, a list of dictionaries can represent multiple users, each with their own attributes like name and age.",
          },
          {
            id: "c4",
            type: "highlight",
            text: "Nested structures allow you to model real-world data more effectively.",
          },
          {
            id: "c5",
            type: "content_card",
            title: "Examples",
            description:
              "Visualizing how nested data appears in common scenarios like API responses.",
            disableExpandableContent: false,
            items: [
              {
                title: "List of Dict",
                content: "users = [{'name':'A'}, {'name':'B'}]",
                expandableContent: "Common in APIs",
              },
              {
                title: "Dict of List",
                content: "{'scores':[10,20,30]}",
                expandableContent: "Useful for grouping data",
              },
            ],
          },
          {
            id: "c6",
            type: "accordion",
            title: "Accessing Data",
            description:
              "Understand the syntax for 'chaining' indexes and keys to reach deeply nested values.",
            items: [
              {
                title: "List in Dict",
                content: "data['scores'][0]",
              },
              {
                title: "Dict in List",
                content: "users[0]['name']",
              },
            ],
          },
          {
            id: "c7",
            type: "summary",
            comments: [
              "Combine structures",
              "Represent complex data",
              "Widely used in APIs",
            ],
          },
        ],
        additionalContents: [
          {
            id: "a1",
            type: "multiple_choice",
            position: "after",
            content: {
              id: "quiz1",
              question: "What is nested data structure?",
              description:
                "Choose the definition that best fits the concept of nesting in programming.",
              options: [
                { id: "o1", text: "Single variable" },
                { id: "o2", text: "Structure inside another structure" },
                { id: "o3", text: "Only numbers" },
              ],
              correctAnswers: ["o2"],
            },
          },
        ],
      },
    ],
  },
};
