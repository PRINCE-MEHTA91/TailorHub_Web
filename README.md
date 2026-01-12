# TailorHub

## Problem
Finding a reliable tailor for clothing alterations or custom garments can be a frustrating and time-consuming process. Customers often rely on word-of-mouth or spend time searching for local shops with uncertain quality and availability. For tailors, managing appointments, orders, and customer communication can be inefficient, often relying on manual methods that limit their ability to grow their business.

## Target Users
*   **Customers:** Anyone in need of tailoring services, from simple alterations to custom-made clothing, who is looking for a convenient way to find and connect with skilled tailors.
*   **Tailors:** Professional tailors and tailoring businesses who want to reach a broader customer base, streamline their booking process, and manage their orders more effectively.

## Core Idea
TailorHub is a web-based platform that connects customers with a network of professional tailors in their local area. The application provides an end-to-end solution for all tailoring needs:
*   **Tailor Discovery:** Customers can search for and browse profiles of nearby tailors, viewing their specialties, pricing, and customer reviews.
*   **Online Booking:** Customers can easily book appointments for consultations or fittings directly through the platform based on the tailor's availability.
*   **Order Placement & Management:** Customers can place orders for specific services, upload design ideas, and provide measurements.
*   **Order Tracking:** Both customers and tailors can track the status of an order from initiation to completion.

## Why it is useful
TailorHub simplifies the entire tailoring experience. 
*   **For Customers:** It offers a convenient, one-stop solution to find, hire, and manage tailoring services, saving time and ensuring a transparent and reliable process.
*   **For Tailors:** It provides a powerful tool to increase visibility, attract new clients, and streamline workflow, allowing them to focus on their craft and grow their business. By digitizing the process, TailorHub brings the traditional tailoring industry into the modern age.

## User Roles and Authentication

TailorHub defines two primary user roles, each with a distinct set of permissions designed to create a secure and efficient experience. Authentication is designed to be seamless, encouraging user registration while providing clear pathways for both new and returning users.

### Authentication: Flipkart-Style Modal

To ensure a smooth user experience for first-time visitors, TailorHub employs a Flipkart-style authentication model:
*   **Initial Visit:** When a user first arrives on the Home Page, the main content is visible, but a modal popup will appear, prompting them to either **Login** or **Sign-Up**. This encourages registration while still allowing users to browse the site's offerings by simply closing the modal.
*   **Seamless Access:** The modal provides a single, centralized point for both new and existing users to access their accounts without navigating away from their current page.

### User Roles

#### 1. Customer
The **Customer** role is for users who are seeking tailoring services. Their experience is focused on finding tailors, managing orders, and communicating their needs.

**Permissions:**
*   Create and manage their own profile (e.g., name, contact information, measurements).
*   Search for tailors based on location, specialty, and ratings.
*   View tailor profiles, including their portfolio, services, and reviews from other customers.
*   Book appointments with tailors.
*   Place orders for tailoring services and upload relevant files (e.g., design images).
*   Track the status of their orders.
*   Communicate with tailors through an integrated messaging system.
*   Leave reviews and ratings for tailors after an order is completed.

#### 2. Tailor
The **Tailor** role is for professional tailors or tailoring businesses offering their services on the platform. Their permissions are centered on managing their business, showcasing their work, and interacting with customers.

**Permissions:**
*   Create and customize a public profile, including their business name, location, hours, and specialties.
*   Upload a portfolio of their work to showcase their skills.
*   Define the services they offer and set their own pricing.
*   Manage their availability for appointments.
*   Receive and accept/decline new order requests from customers.
*   Update the status of orders (e.g., "In Progress," "Ready for Pickup").
*   Communicate with customers regarding their orders.
*   View their earnings and order history.

### Role-Based Access Control (RBAC)

TailorHub uses Role-Based Access Control to ensure that users can only access the features and data relevant to their role. This is critical for security and usability:
*   **Segregation of Duties:** Customers cannot access the dashboards of tailors, and tailors cannot act as customers from their tailor account. This separation prevents unauthorized actions, such as a customer trying to update another user's order.
*   **Data Privacy:** A customer's personal information (e.g., measurements, order history) is only visible to the tailors they have active orders with. Similarly, a tailor's private business metrics are not visible to customers.
*   **Intuitive User Interface:** The user interface is tailored to the user's role. For example, a logged-in customer will see a dashboard focused on their orders and appointments, while a tailor will see tools for managing their business.

This RBAC system ensures that the platform is not only functional but also secure and intuitive for all user types.

## How to run the project

### Prerequisites

*   [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1.  Clone the repository or download the source code.
2.  Open a terminal in the project directory.
3.  Install the backend dependencies by running the following command:

    ```bash
    npm install express cors
    ```

### Running the Application

1.  **Start the backend server:**

    Open a terminal in the project directory and run the following command:

    ```bash
    npm start
    ```

    The server will start on `http://localhost:3000`. You will see the message "Server is running on http://localhost:3000" in the console.

2.  **Open the frontend:**

    Open the `index.html` file in your web browser.

### How it Works

When you click on any of the buttons in the application, a request is sent to the backend server. The server logs the button click to the console. You can see these logs in the terminal where the server is running. You can also see a confirmation message in the browser's developer console.
