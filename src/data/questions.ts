export interface TestCase {
  input: string;
  expectedOutput: string;
  explanation?: string;
}

export interface Question {
  title: string;
  description: string;
  examples: TestCase[];
  testCases: {
    basic: TestCase[];
    edge: TestCase[];
    performance: TestCase[];
  };
  starterCode?: {
    [key: string]: string;
  };
  difficulty: number;
}

export const questions: { [key: number]: Question } = {
  1: {
    title: "Two Sum",
    description: `Given an array of integers nums and an integer target, return indices of the two numbers in nums such that they add up to target.
    
You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.`,
    difficulty: 1,
    examples: [
      {
        input: "nums = [2,7,11,15], target = 9",
        expectedOutput: "[0,1]",
        explanation: "Because nums[0] + nums[1] == 9, we return [0, 1].",
      },
    ],
    testCases: {
      basic: [
        {
          input: "nums = [3,2,4], target = 6",
          expectedOutput: "[1,2]",
        },
        {
          input: "nums = [3,3], target = 6",
          expectedOutput: "[0,1]",
        },
      ],
      edge: [
        {
          input: "nums = [1], target = 1",
          expectedOutput: "[]",
          explanation: "No solution exists",
        },
        {
          input: "nums = [-1,-2,-3,-4,-5], target = -8",
          expectedOutput: "[2,4]",
        },
      ],
      performance: [
        {
          input: "nums = " + JSON.stringify(Array.from({ length: 1000 }, (_, i) => i)) + ", target = 1997",
          expectedOutput: "[998,999]",
        },
      ],
    },
    starterCode: {
      javascript: `function twoSum(nums, target) {
    // Your code here
    // Return array of two indices that sum to target
};`,
      python: `def two_sum(nums, target):
    # Your code here
    # Return array of two indices that sum to target
    pass`,
      typescript: `function twoSum(nums: number[], target: number): number[] {
    // Your code here
    // Return array of two indices that sum to target
}`,
    },
  },
  2: {
    title: "Maximum Subarray",
    description: `Given an integer array nums, find the subarray with the largest sum and return its sum.
    
A subarray is a contiguous part of an array.`,
    difficulty: 2,
    examples: [
      {
        input: "nums = [-2,1,-3,4,-1,2,1,-5,4]",
        expectedOutput: "6",
        explanation: "The subarray [4,-1,2,1] has the largest sum = 6.",
      },
    ],
    testCases: {
      basic: [
        {
          input: "nums = [1]",
          expectedOutput: "1",
        },
        {
          input: "nums = [5,4,-1,7,8]",
          expectedOutput: "23",
        },
      ],
      edge: [
        {
          input: "nums = [-1]",
          expectedOutput: "-1",
        },
        {
          input: "nums = [-2,-1]",
          expectedOutput: "-1",
        },
      ],
      performance: [
        {
          input: "nums = " + JSON.stringify(Array.from({ length: 1000 }, () => Math.floor(Math.random() * 201) - 100)),
          expectedOutput: "computed", // This will need to be computed based on the random array
        },
      ],
    },
    starterCode: {
      javascript: `function maxSubArray(nums) {
    // Your code here
    // Return the sum of the subarray with largest sum
};`,
      python: `def max_sub_array(nums):
    # Your code here
    # Return the sum of the subarray with largest sum
    pass`,
      typescript: `function maxSubArray(nums: number[]): number {
    // Your code here
    // Return the sum of the subarray with largest sum
}`,
    },
  },
  3: {
    title: "Contains Duplicate",
    description: `Given an integer array nums, return true if any value appears at least twice in the array, and false if every element is distinct.`,
    difficulty: 1,
    examples: [
      {
        input: "nums = [1,2,3,1]",
        expectedOutput: "true",
        explanation: "1 appears twice in the array.",
      },
    ],
    testCases: {
      basic: [
        {
          input: "nums = [1,2,3,4]",
          expectedOutput: "false",
        },
        {
          input: "nums = [1,1,1,3,3,4,3,2,4,2]",
          expectedOutput: "true",
        },
      ],
      edge: [
        {
          input: "nums = [1]",
          expectedOutput: "false",
        },
        {
          input: "nums = []",
          expectedOutput: "false",
        },
      ],
      performance: [
        {
          input: "nums = " + JSON.stringify(Array.from({ length: 1000 }, (_, i) => i % 999)),
          expectedOutput: "true",
        },
      ],
    },
    starterCode: {
      javascript: `function containsDuplicate(nums) {
    // Your code here
    // Return true if array contains duplicates, false otherwise
};`,
      python: `def contains_duplicate(nums):
    # Your code here
    # Return true if array contains duplicates, false otherwise
    pass`,
      typescript: `function containsDuplicate(nums: number[]): boolean {
    // Your code here
    // Return true if array contains duplicates, false otherwise
}`,
    },
  },
  4: {
    title: "Group Anagrams",
    description: `Given an array of strings strs, group the anagrams together. You can return the answer in any order.
    
An Anagram is a word or phrase formed by rearranging the letters of a different word or phrase, typically using all the original letters exactly once.`,
    difficulty: 2,
    examples: [
      {
        input: 'strs = ["eat","tea","tan","ate","nat","bat"]',
        expectedOutput: '[["bat"],["nat","tan"],["ate","eat","tea"]]',
        explanation: "The input strings are grouped by their anagram categories.",
      },
    ],
    testCases: {
      basic: [
        {
          input: 'strs = ["eat","tea","tan","ate","nat","bat"]',
          expectedOutput: '[["bat"],["nat","tan"],["ate","eat","tea"]]',
        },
        {
          input: 'strs = ["hi","ih"]',
          expectedOutput: '[["hi","ih"]]',
        },
      ],
      edge: [
        {
          input: 'strs = ["a"]',
          expectedOutput: '[["a"]]',
        },
        {
          input: 'strs = [""]',
          expectedOutput: '[[""]]',
        },
      ],
      performance: [
        {
          input: 'strs = ' + JSON.stringify(Array.from({ length: 1000 }, (_, i) => i.toString())),
          expectedOutput: 'computed', // This will need to be computed based on the random array
        },
      ],
    },
    starterCode: {
      javascript: `function groupAnagrams(strs) {
    // Your code here
    // Return array of anagram groups
};`,
      python: `def group_anagrams(strs):
    # Your code here
    # Return array of anagram groups
    pass`,
      typescript: `function groupAnagrams(strs: string[]): string[][] {
    // Your code here
    // Return array of anagram groups
}`,
    },
  },
  5: {
    title: "Top K Frequent Elements",
    description: `Given an integer array nums and an integer k, return the k most frequent elements. You may return the answer in any order.`,
    difficulty: 2,
    examples: [
      {
        input: "nums = [1,1,1,2,2,3], k = 2",
        expectedOutput: "[1,2]",
        explanation: "The numbers 1 and 2 are the two most frequent elements.",
      },
    ],
    testCases: {
      basic: [
        {
          input: "nums = [1,2], k = 2",
          expectedOutput: "[1,2]",
        },
        {
          input: "nums = [1,1,1,2,2,2,3,3,3], k = 1",
          expectedOutput: "[1]",
        },
      ],
      edge: [
        {
          input: "nums = [1], k = 1",
          expectedOutput: "[1]",
        },
        {
          input: "nums = [], k = 2",
          expectedOutput: "[]",
        },
      ],
      performance: [
        {
          input: "nums = " + JSON.stringify(Array.from({ length: 1000 }, (_, i) => i % 10)) + ", k = 10",
          expectedOutput: 'computed', // This will need to be computed based on the random array
        },
      ],
    },
    starterCode: {
      javascript: `function topKFrequent(nums, k) {
    // Your code here
    // Return array of k most frequent elements
};`,
      python: `def top_k_frequent(nums, k):
    # Your code here
    # Return array of k most frequent elements
    pass`,
      typescript: `function topKFrequent(nums: number[], k: number): number[] {
    // Your code here
    // Return array of k most frequent elements
}`,
    },
  },
  6: {
    title: "Reverse Linked List",
    description: `Given the head of a singly linked list, reverse the list and return its reversed version.`,
    difficulty: 2,
    examples: [
      {
        input: "head = [1,2,3,4,5]",
        expectedOutput: "[5,4,3,2,1]",
        explanation: "The linked list is reversed.",
      },
    ],
    testCases: {
      basic: [
        {
          input: "head = [1,2]",
          expectedOutput: "[2,1]",
        },
        {
          input: "head = [1]",
          expectedOutput: "[1]",
        },
      ],
      edge: [
        {
          input: "head = []",
          expectedOutput: "[]",
        },
        {
          input: "head = [1,2,3,4,5,6,7,8,9,10]",
          expectedOutput: "[10,9,8,7,6,5,4,3,2,1]",
        },
      ],
      performance: [
        {
          input: "head = " + JSON.stringify(Array.from({ length: 1000 }, (_, i) => i + 1)),
          expectedOutput: 'computed', // This will need to be computed based on the random array
        },
      ],
    },
    starterCode: {
      javascript: `function reverseList(head) {
    // Your code here
    // Return reversed linked list
};`,
      python: `def reverse_list(head):
    # Your code here
    # Return reversed linked list
    pass`,
      typescript: `function reverseList(head: ListNode | null): ListNode | null {
    // Your code here
    // Return reversed linked list
}`,
    },
  },
  7: {
    title: "Merge Two Sorted Lists",
    description: `You are given the heads of two sorted linked lists list1 and list2. Merge the two lists in a sorted manner and return the head of the merged list.`,
    difficulty: 2,
    examples: [
      {
        input: "list1 = [1,2,4], list2 = [1,3,4]",
        expectedOutput: "[1,1,2,3,4,4]",
        explanation: "The two sorted lists are merged into one.",
      },
    ],
    testCases: {
      basic: [
        {
          input: "list1 = [1,2], list2 = [1,3]",
          expectedOutput: "[1,1,2,3]",
        },
        {
          input: "list1 = [1], list2 = [1]",
          expectedOutput: "[1,1]",
        },
      ],
      edge: [
        {
          input: "list1 = [], list2 = [1]",
          expectedOutput: "[1]",
        },
        {
          input: "list1 = [1], list2 = []",
          expectedOutput: "[1]",
        },
      ],
      performance: [
        {
          input: "list1 = " + JSON.stringify(Array.from({ length: 1000 }, (_, i) => i + 1)) + ", list2 = " + JSON.stringify(Array.from({ length: 1000 }, (_, i) => i + 1)),
          expectedOutput: 'computed', // This will need to be computed based on the random array
        },
      ],
    },
    starterCode: {
      javascript: `function mergeTwoLists(list1, list2) {
    // Your code here
    // Return merged linked list
};`,
      python: `def merge_two_lists(list1, list2):
    # Your code here
    # Return merged linked list
    pass`,
      typescript: `function mergeTwoLists(list1: ListNode | null, list2: ListNode | null): ListNode | null {
    // Your code here
    // Return merged linked list
}`,
    },
  },
  8: {
    title: "Binary Tree Traversal",
    description: `Given the root of a binary tree, return the inorder traversal of its nodes' values.`,
    difficulty: 2,
    examples: [
      {
        input: "root = [1,null,2,3]",
        expectedOutput: "[1,3,2]",
        explanation: "The inorder traversal of the binary tree is [1,3,2].",
      },
    ],
    testCases: {
      basic: [
        {
          input: "root = [1]",
          expectedOutput: "[1]",
        },
        {
          input: "root = [1,2]",
          expectedOutput: "[2,1]",
        },
      ],
      edge: [
        {
          input: "root = []",
          expectedOutput: "[]",
        },
        {
          input: "root = [1,null,2,null,3,null,4,null,5]",
          expectedOutput: "[1,3,2,5,4]",
        },
      ],
      performance: [
        {
          input: "root = " + JSON.stringify(Array.from({ length: 1000 }, (_, i) => i + 1)),
          expectedOutput: 'computed', // This will need to be computed based on the random array
        },
      ],
    },
    starterCode: {
      javascript: `function inorderTraversal(root) {
    // Your code here
    // Return inorder traversal of binary tree
};`,
      python: `def inorder_traversal(root):
    # Your code here
    # Return inorder traversal of binary tree
    pass`,
      typescript: `function inorderTraversal(root: TreeNode | null): number[] {
    // Your code here
    // Return inorder traversal of binary tree
}`,
    },
  },
  9: {
    title: "Climbing Stairs",
    description: `You are climbing a staircase. It takes n steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?`,
    difficulty: 2,
    examples: [
      {
        input: "n = 2",
        expectedOutput: "2",
        explanation: "There are two ways to climb to the top: 1 step + 1 step or 2 steps.",
      },
    ],
    testCases: {
      basic: [
        {
          input: "n = 1",
          expectedOutput: "1",
        },
        {
          input: "n = 3",
          expectedOutput: "3",
        },
      ],
      edge: [
        {
          input: "n = 0",
          expectedOutput: "1",
        },
        {
          input: "n = 45",
          expectedOutput: "183368971",
        },
      ],
      performance: [
        {
          input: "n = 46",
          expectedOutput: 'computed', // This will need to be computed based on the random array
        },
      ],
    },
    starterCode: {
      javascript: `function climbStairs(n) {
    // Your code here
    // Return number of distinct ways to climb to the top
};`,
      python: `def climb_stairs(n):
    # Your code here
    # Return number of distinct ways to climb to the top
    pass`,
      typescript: `function climbStairs(n: number): number {
    // Your code here
    // Return number of distinct ways to climb to the top
}`,
    },
  },
  10: {
    title: "Number of Islands",
    description: `Given an m x n 2D binary grid grid which represents a map of '1's (land) and '0's (water), return the number of islands.
    
An island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically. You may assume all four edges of the grid are surrounded by water.`,
    difficulty: 2,
    examples: [
      {
        input: "grid = [[1,1,1,0],[1,1,0,0],[0,0,0,1]]",
        expectedOutput: "2",
        explanation: "There are two islands in the grid.",
      },
    ],
    testCases: {
      basic: [
        {
          input: "grid = [[1,1,1,1],[1,1,1,1],[1,1,1,1],[1,1,1,1]]",
          expectedOutput: "1",
        },
        {
          input: "grid = [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]]",
          expectedOutput: "0",
        },
      ],
      edge: [
        {
          input: "grid = [[1]]",
          expectedOutput: "1",
        },
        {
          input: "grid = [[0]]",
          expectedOutput: "0",
        },
      ],
      performance: [
        {
          input: "grid = " + JSON.stringify(Array.from({ length: 100 }, (_, i) => Array.from({ length: 100 }, (_, j) => Math.floor(Math.random() * 2)))),
          expectedOutput: 'computed', // This will need to be computed based on the random array
        },
      ],
    },
    starterCode: {
      javascript: `function numIslands(grid) {
    // Your code here
    // Return number of islands in the grid
};`,
      python: `def num_islands(grid):
    # Your code here
    # Return number of islands in the grid
    pass`,
      typescript: `function numIslands(grid: string[][]): number {
    // Your code here
    // Return number of islands in the grid
}`,
    },
  },
};

export const practiceQuestions = {
  "self-practice": questions[1],
  "peer-practice": questions[2],
  "company-practice": questions[3],
};
