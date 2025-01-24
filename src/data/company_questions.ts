export const companyQuestions = [
  {
    id: 1,
    title: "Arrays and Hashing",
    description: "Questions focusing on array manipulation and hash table usage",
    questions: [
      {
        id: 1,
        title: "Two Sum",
        description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
        difficulty: "Easy",
        timeLimit: 30,
        tags: ["Arrays", "Hash Table"],
        companies: ["Amazon", "Google", "Microsoft", "Meta"],
        examples: [
          {
            input: "nums = [2,7,11,15], target = 9",
            output: "[0,1]",
            explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]."
          }
        ]
      },
      {
        id: 2,
        title: "Group Anagrams",
        description: "Given an array of strings strs, group the anagrams together. You can return the answer in any order.",
        difficulty: "Medium",
        timeLimit: 45,
        tags: ["Arrays", "Hash Table", "String"],
        companies: ["Amazon", "Microsoft", "Apple"],
        examples: [
          {
            input: 'strs = ["eat","tea","tan","ate","nat","bat"]',
            output: '[["bat"],["nat","tan"],["ate","eat","tea"]]',
            explanation: "The strings can be regrouped as anagrams."
          }
        ]
      }
    ]
  },
  {
    id: 2,
    title: "Two Pointers",
    description: "Problems solved using two pointer technique",
    questions: [
      {
        id: 3,
        title: "Valid Palindrome",
        description: "Given a string s, return true if it is a palindrome, or false otherwise.",
        difficulty: "Easy",
        timeLimit: 30,
        tags: ["Two Pointers", "String"],
        companies: ["Facebook", "Microsoft", "Amazon"],
        examples: [
          {
            input: 's = "A man, a plan, a canal: Panama"',
            output: "true",
            explanation: "After removing non-alphanumeric characters and converting to lowercase, it reads the same forward and backward."
          }
        ]
      }
    ]
  },
  {
    id: 3,
    title: "Stack",
    description: "Questions involving stack data structure",
    questions: [
      {
        id: 4,
        title: "Valid Parentheses",
        description: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
        difficulty: "Easy",
        timeLimit: 30,
        tags: ["Stack", "String"],
        companies: ["Google", "Amazon", "Microsoft"],
        examples: [
          {
            input: 's = "()[]{}"',
            output: "true",
            explanation: "The brackets are properly closed in the correct order."
          }
        ]
      }
    ]
  },
  {
    id: 4,
    title: "Binary Search",
    description: "Problems solved using binary search algorithm",
    questions: [
      {
        id: 5,
        title: "Search in Rotated Sorted Array",
        description: "Given a rotated sorted array nums and a target value, return the index if the target is found. If not, return -1.",
        difficulty: "Medium",
        timeLimit: 45,
        tags: ["Binary Search", "Array"],
        companies: ["Amazon", "Microsoft", "Apple", "Google"],
        examples: [
          {
            input: "nums = [4,5,6,7,0,1,2], target = 0",
            output: "4",
            explanation: "Target 0 is found at index 4."
          }
        ]
      }
    ]
  },
  {
    id: 5,
    title: "Sliding Window",
    description: "Questions using sliding window technique",
    questions: [
      {
        id: 6,
        title: "Longest Substring Without Repeating Characters",
        description: "Given a string s, find the length of the longest substring without repeating characters.",
        difficulty: "Medium",
        timeLimit: 45,
        tags: ["Sliding Window", "String", "Hash Table"],
        companies: ["Amazon", "Microsoft", "Google", "Meta"],
        examples: [
          {
            input: 's = "abcabcbb"',
            output: "3",
            explanation: "The longest substring is 'abc' with length 3."
          }
        ]
      }
    ]
  },
  {
    id: 6,
    title: "Trees",
    description: "Binary tree and BST problems",
    questions: [
      {
        id: 7,
        title: "Invert Binary Tree",
        description: "Given the root of a binary tree, invert the tree, and return its root.",
        difficulty: "Easy",
        timeLimit: 30,
        tags: ["Tree", "DFS", "BFS"],
        companies: ["Google", "Amazon", "Microsoft"],
        examples: [
          {
            input: "root = [4,2,7,1,3,6,9]",
            output: "[4,7,2,9,6,3,1]",
            explanation: "The tree is inverted by swapping each node's left and right children."
          }
        ]
      }
    ]
  },
  {
    id: 7,
    title: "Dynamic Programming",
    description: "Problems solved using dynamic programming",
    questions: [
      {
        id: 8,
        title: "Climbing Stairs",
        description: "You are climbing a staircase. It takes n steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?",
        difficulty: "Easy",
        timeLimit: 30,
        tags: ["Dynamic Programming"],
        companies: ["Amazon", "Google", "Adobe"],
        examples: [
          {
            input: "n = 3",
            output: "3",
            explanation: "There are three ways: (1,1,1), (1,2), (2,1)"
          }
        ]
      }
    ]
  }
];
