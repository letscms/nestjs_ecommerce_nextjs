'use client';
import Header from "@/components/front/Header";
import { useAuth } from "@/contexts/AuthContext";
import Image from "next/image";

export default function Home() {
  const { user } = useAuth();
  console.log("User Auth:", user);
  return (
    <div className="container-fluid">
      <Header />

      

      {/* Main Content */}
      <div className="container mt-5">
        <div className="row">
          <div className="col-12">
            <div className="jumbotron bg-light p-5 rounded">
              <h1 className="display-4">Welcome to Admin Dashboard</h1>
              <p className="lead">
                Manage your e-commerce platform with ease.
              </p>
              <hr className="my-4" />
              <p>
                Get started by exploring the different sections of your admin
                panel.
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="row mt-4">
          <div className="col-md-3 mb-4">
            <div className="card text-white bg-primary">
              <div className="card-header">
                <h5 className="card-title">Total Users</h5>
              </div>
              <div className="card-body">
                <h2 className="card-text">1,234</h2>
                <small>+12% from last month</small>
              </div>
            </div>
          </div>
          <div className="col-md-3 mb-4">
            <div className="card text-white bg-success">
              <div className="card-header">
                <h5 className="card-title">Total Orders</h5>
              </div>
              <div className="card-body">
                <h2 className="card-text">567</h2>
                <small>+8% from last month</small>
              </div>
            </div>
          </div>
          <div className="col-md-3 mb-4">
            <div className="card text-white bg-warning">
              <div className="card-header">
                <h5 className="card-title">Products</h5>
              </div>
              <div className="card-body">
                <h2 className="card-text">890</h2>
                <small>+23% from last month</small>
              </div>
            </div>
          </div>
          <div className="col-md-3 mb-4">
            <div className="card text-white bg-info">
              <div className="card-header">
                <h5 className="card-title">Revenue</h5>
              </div>
              <div className="card-body">
                <h2 className="card-text">$45,678</h2>
                <small>+15% from last month</small>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="row mt-4">
          <div className="col-md-6">
            <div className="card">
              <div className="card-header">
                <h5 className="card-title">Quick Actions</h5>
              </div>
              <div className="card-body">
                <div className="d-grid gap-2">
                  <button className="btn btn-primary" type="button">
                    Add New Product
                  </button>
                  <button className="btn btn-success" type="button">
                    View Orders
                  </button>
                  <button className="btn btn-info" type="button">
                    Manage Users
                  </button>
                  <button className="btn btn-warning" type="button">
                    Generate Reports
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="card">
              <div className="card-header">
                <h5 className="card-title">Recent Activity</h5>
              </div>
              <div className="card-body">
                <ul className="list-group list-group-flush">
                  <li className="list-group-item d-flex justify-content-between align-items-center">
                    New user registered
                    <span className="badge bg-primary rounded-pill">2m ago</span>
                  </li>
                  <li className="list-group-item d-flex justify-content-between align-items-center">
                    Order #1234 completed
                    <span className="badge bg-success rounded-pill">5m ago</span>
                  </li>
                  <li className="list-group-item d-flex justify-content-between align-items-center">
                    Product updated
                    <span className="badge bg-warning rounded-pill">10m ago</span>
                  </li>
                  <li className="list-group-item d-flex justify-content-between align-items-center">
                    New review posted
                    <span className="badge bg-info rounded-pill">15m ago</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Getting Started Section */}
        <div className="row mt-5">
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h5 className="card-title">Getting Started</h5>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-4">
                    <div className="text-center">
                      <div className="mb-3">
                        <Image
                          src="/file.svg"
                          alt="File icon"
                          width={48}
                          height={48}
                        />
                      </div>
                      <h6>Edit Your Profile</h6>
                      <p className="text-muted">
                        Customize your admin profile and settings
                      </p>
                      <button className="btn btn-outline-primary btn-sm">
                        Get Started
                      </button>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="text-center">
                      <div className="mb-3">
                        <Image
                          src="/window.svg"
                          alt="Window icon"
                          width={48}
                          height={48}
                        />
                      </div>
                      <h6>Explore Features</h6>
                      <p className="text-muted">
                        Discover all the powerful features available
                      </p>
                      <button className="btn btn-outline-primary btn-sm">
                        Learn More
                      </button>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="text-center">
                      <div className="mb-3">
                        <Image
                          src="/globe.svg"
                          alt="Globe icon"
                          width={48}
                          height={48}
                        />
                      </div>
                      <h6>Documentation</h6>
                      <p className="text-muted">
                        Read our comprehensive documentation
                      </p>
                      <button className="btn btn-outline-primary btn-sm">
                        Read Docs
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-dark text-light mt-5 py-4">
        <div className="container">
          <div className="row">
            <div className="col-md-6">
              <p>&copy; 2024 E-commerce Admin. All rights reserved.</p>
            </div>
            <div className="col-md-6 text-md-end">
              <a href="#" className="text-light me-3">
                Privacy Policy
              </a>
              <a href="#" className="text-light me-3">
                Terms of Service
              </a>
              <a href="#" className="text-light">
                Support
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
