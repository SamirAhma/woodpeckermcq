import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const leetcodePatterns = [
    {
        title: "The Blind 75 Pattern Set",
        questions: [
            {
                question: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
                options: ["Two Pointers", "Hash Map", "Binary Search", "Sorting"],
                answer: "Hash Map",
                explanation: "A Hash Map allows us to store the complement of each number as we iterate, enabling O(1) lookups to find the matching pair.",
                patternTag: "Arrays & Hashing"
            },
            {
                question: "You are given an array of prices where prices[i] is the price of a given stock on the ith day. Find the maximum profit.",
                options: ["Dynamic Programming", "Sliding Window", "Greedy", "Two Pointers"],
                answer: "Sliding Window",
                explanation: "Use a sliding window (or two pointers) to track the minimum price seen so far and calculate the potential profit for each subsequent day.",
                patternTag: "Sliding Window"
            },
            {
                question: "Given an integer array nums, return an array answer such that answer[i] is equal to the product of all the elements of nums except nums[i].",
                options: ["Prefix & Suffix Products", "Division Operator", "Nested Loops", "Stack"],
                answer: "Prefix & Suffix Products",
                explanation: "Calculate prefix products in one pass and suffix products in another to get the result in O(N) time without using division.",
                patternTag: "Arrays & Hashing"
            },
            {
                question: "Given an integer array nums, find the subarray with the largest sum and return its sum.",
                options: ["Sliding Window", "Kadane's Algorithm", "Divide and Conquer", "Dynamic Programming"],
                answer: "Kadane's Algorithm",
                explanation: "Kadane's algorithm iterates through the array, keeping track of the maximum subarray sum ending at each position.",
                patternTag: "Greedy"
            },
            {
                question: "Given an array of integers nums that is sorted in ascending order, find the starting and ending position of a given target value.",
                options: ["Linear Scan", "Binary Search", "Two Pointers", "Hash Table"],
                answer: "Binary Search",
                explanation: "Since the array is sorted, we can use two binary searches to find the leftmost and rightmost occurrences of the target.",
                patternTag: "Binary Search"
            },
            {
                question: "Reverse a singly linked list.",
                options: ["Recursion", "Iterative with 3 Pointers", "Stack", "Queue"],
                answer: "Iterative with 3 Pointers",
                explanation: "Use 'prev', 'curr', and 'next' pointers to reverse the links as you traverse the list.",
                patternTag: "Linked List"
            },
            {
                question: "Given the root of a binary tree, return its maximum depth.",
                options: ["BFS", "DFS (Recursive)", "DFS (Iterative)", "All of the above"],
                answer: "All of the above",
                explanation: "Maximum depth can be found using Breadth-First Search or Depth-First Search (either recursive or iterative).",
                patternTag: "Trees"
            },
            {
                question: "Given two strings s and t, return true if t is an anagram of s, and false otherwise.",
                options: ["Sorting", "Hash Map (Frequency Count)", "Two Pointers", "Both Sorting and Hash Map"],
                answer: "Both Sorting and Hash Map",
                explanation: "Both sorting the strings and comparing them, or using a hash map to count character frequencies, are valid O(N log N) or O(N) approaches.",
                patternTag: "Arrays & Hashing"
            },
            {
                question: "Given a string s, find the length of the longest substring without repeating characters.",
                options: ["Sliding Window + HashSet", "Nested Loops", "Dynamic Programming", "Two Pointers + Sorting"],
                answer: "Sliding Window + HashSet",
                explanation: "Use a sliding window with a HashSet to keep track of unique characters in the current window.",
                patternTag: "Sliding Window"
            },
            {
                question: "Determine if a 9 x 9 Sudoku board is valid.",
                options: ["Backtracking", "Hash Set for Rows, Cols, and Squares", "Brute Force", "Bitmasking"],
                answer: "Hash Set for Rows, Cols, and Squares",
                explanation: "Check each row, column, and 3x3 sub-grid for duplicate numbers using Hash Sets.",
                patternTag: "Arrays & Hashing"
            }
        ]
    }
];

async function main() {
    console.log("Seeding LeetCode patterns...");
    for (const set of leetcodePatterns) {
        const createdSet = await prisma.mCQSet.create({
            data: {
                title: set.title,
                questions: {
                    create: set.questions
                }
            }
        });
        console.log(`Created set: ${createdSet.title} with ${set.questions.length} questions.`);
    }
    console.log("Seeding complete!");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
