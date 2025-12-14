#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime

class CultureClubAPITester:
    def __init__(self, base_url="https://fermentstation.preview.emergentagent.com"):
        self.base_url = base_url
        self.session_token = "test_session_1765719491304"
        self.test_user_id = "test_user_12345"
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []
        self.passed_tests = []

    def run_test(self, name, method, endpoint, expected_status, data=None, use_auth=True):
        """Run a single API test"""
        url = f"{self.base_url}/api/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        if use_auth:
            headers['Cookie'] = f'session_token={self.session_token}'

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                self.passed_tests.append(name)
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    print(f"   Response: {json.dumps(response_data, indent=2)[:200]}...")
                except:
                    print(f"   Response: {response.text[:200]}...")
            else:
                self.failed_tests.append({
                    "test": name,
                    "expected": expected_status,
                    "actual": response.status_code,
                    "response": response.text[:500]
                })
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}...")

            return success, response.json() if success and response.text else {}

        except Exception as e:
            self.failed_tests.append({
                "test": name,
                "error": str(e)
            })
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_auth_endpoints(self):
        """Test authentication endpoints"""
        print("\n=== TESTING AUTHENTICATION ENDPOINTS ===")
        
        # Test get current user
        success, user_data = self.run_test(
            "Get Current User",
            "GET",
            "auth/me",
            200
        )
        
        if success:
            print(f"✅ User authenticated: {user_data.get('name', 'Unknown')}")
            return user_data
        else:
            print("❌ Authentication failed - cannot proceed with protected endpoints")
            return None

    def test_projects_endpoints(self):
        """Test project management endpoints"""
        print("\n=== TESTING PROJECTS ENDPOINTS ===")
        
        # Get projects
        success, projects = self.run_test(
            "Get Projects",
            "GET",
            "projects",
            200
        )
        
        # Create new project
        project_data = {
            "name": "Test Kimchi Batch",
            "fermentation_type": "Kimchi",
            "estimated_duration": 14,
            "notes": "Test project for API testing",
            "start_date": datetime.now().isoformat()
        }
        
        success, new_project = self.run_test(
            "Create Project",
            "POST",
            "projects",
            200,
            project_data
        )
        
        if success and new_project.get('project_id'):
            project_id = new_project['project_id']
            
            # Get specific project
            self.run_test(
                "Get Specific Project",
                "GET",
                f"projects/{project_id}",
                200
            )
            
            # Update project
            update_data = {
                "notes": "Updated notes for testing"
            }
            self.run_test(
                "Update Project",
                "PUT",
                f"projects/{project_id}",
                200,
                update_data
            )
            
            return project_id
        
        return None

    def test_reminders_endpoints(self, project_id):
        """Test reminder endpoints"""
        print("\n=== TESTING REMINDERS ENDPOINTS ===")
        
        if not project_id:
            print("⚠️ Skipping reminder tests - no project ID available")
            return
        
        # Get reminders
        self.run_test(
            "Get All Reminders",
            "GET",
            "reminders",
            200
        )
        
        # Get project-specific reminders
        self.run_test(
            "Get Project Reminders",
            "GET",
            f"reminders?project_id={project_id}",
            200
        )
        
        # Create reminder
        reminder_data = {
            "project_id": project_id,
            "reminder_type": "stir",
            "scheduled_time": datetime.now().isoformat()
        }
        
        success, new_reminder = self.run_test(
            "Create Reminder",
            "POST",
            "reminders",
            200,
            reminder_data
        )
        
        if success and new_reminder.get('reminder_id'):
            reminder_id = new_reminder['reminder_id']
            
            # Update reminder
            update_data = {
                "is_completed": True
            }
            self.run_test(
                "Update Reminder",
                "PUT",
                f"reminders/{reminder_id}",
                200,
                update_data
            )

    def test_feed_endpoints(self):
        """Test community feed endpoints"""
        print("\n=== TESTING FEED ENDPOINTS ===")
        
        # Get feed
        success, posts = self.run_test(
            "Get Feed",
            "GET",
            "feed",
            200
        )
        
        # Create post
        post_data = {
            "content": "Testing the API with a new fermentation post!",
            "youtube_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            "tags": ["test", "api"]
        }
        
        success, new_post = self.run_test(
            "Create Post",
            "POST",
            "posts",
            200,
            post_data
        )
        
        if success and new_post.get('post_id'):
            post_id = new_post['post_id']
            
            # Like post
            self.run_test(
                "Like Post",
                "POST",
                f"posts/{post_id}/like",
                200
            )
            
            # Unlike post (like again)
            self.run_test(
                "Unlike Post",
                "POST",
                f"posts/{post_id}/like",
                200
            )
            
            # Get comments
            self.run_test(
                "Get Comments",
                "GET",
                f"posts/{post_id}/comments",
                200
            )
            
            # Create comment
            comment_data = {
                "content": "Great post! Testing the comment API."
            }
            self.run_test(
                "Create Comment",
                "POST",
                f"posts/{post_id}/comments",
                200,
                comment_data
            )

    def test_recipes_endpoints(self):
        """Test recipe endpoints"""
        print("\n=== TESTING RECIPES ENDPOINTS ===")
        
        # Get recipes
        self.run_test(
            "Get Recipes",
            "GET",
            "recipes",
            200
        )
        
        # Create recipe
        recipe_data = {
            "title": "Test Sauerkraut Recipe",
            "description": "A simple sauerkraut recipe for testing",
            "ingredients": ["Cabbage", "Salt", "Caraway seeds"],
            "instructions": ["Shred cabbage", "Salt and massage", "Pack in jar", "Ferment 3-4 weeks"],
            "recipe_type": "Sauerkraut",
            "tags": ["test", "sauerkraut", "beginner"]
        }
        
        success, new_recipe = self.run_test(
            "Create Recipe",
            "POST",
            "recipes",
            200,
            recipe_data
        )
        
        if success and new_recipe.get('recipe_id'):
            recipe_id = new_recipe['recipe_id']
            
            # Get specific recipe
            self.run_test(
                "Get Specific Recipe",
                "GET",
                f"recipes/{recipe_id}",
                200
            )

    def test_profile_endpoints(self):
        """Test user profile endpoints"""
        print("\n=== TESTING PROFILE ENDPOINTS ===")
        
        # Get user profile
        self.run_test(
            "Get User Profile",
            "GET",
            f"users/{self.test_user_id}",
            200
        )
        
        # Update profile
        profile_data = {
            "name": "Test User Updated",
            "bio": "Updated bio for API testing"
        }
        
        self.run_test(
            "Update Profile",
            "PUT",
            "users/profile",
            200,
            profile_data
        )

    def run_all_tests(self):
        """Run comprehensive API test suite"""
        print("🚀 Starting Culture Club API Test Suite")
        print(f"📍 Base URL: {self.base_url}")
        print(f"🔑 Session Token: {self.session_token}")
        
        # Test authentication first
        user_data = self.test_auth_endpoints()
        if not user_data:
            print("\n❌ Authentication failed - stopping tests")
            return False
        
        # Test all endpoints
        project_id = self.test_projects_endpoints()
        self.test_reminders_endpoints(project_id)
        self.test_feed_endpoints()
        self.test_recipes_endpoints()
        self.test_profile_endpoints()
        
        # Print summary
        print(f"\n📊 TEST SUMMARY")
        print(f"✅ Tests passed: {self.tests_passed}/{self.tests_run}")
        print(f"❌ Tests failed: {len(self.failed_tests)}")
        
        if self.failed_tests:
            print(f"\n🔍 FAILED TESTS:")
            for failure in self.failed_tests:
                print(f"   • {failure.get('test', 'Unknown')}: {failure.get('error', f\"Expected {failure.get('expected')}, got {failure.get('actual')}\"}")
        
        success_rate = (self.tests_passed / self.tests_run) * 100 if self.tests_run > 0 else 0
        print(f"\n📈 Success Rate: {success_rate:.1f}%")
        
        return success_rate >= 80

def main():
    tester = CultureClubAPITester()
    success = tester.run_all_tests()
    
    # Save results for test report
    results = {
        "timestamp": datetime.now().isoformat(),
        "total_tests": tester.tests_run,
        "passed_tests": tester.tests_passed,
        "failed_tests": len(tester.failed_tests),
        "success_rate": (tester.tests_passed / tester.tests_run) * 100 if tester.tests_run > 0 else 0,
        "passed_test_names": tester.passed_tests,
        "failed_test_details": tester.failed_tests
    }
    
    with open('/app/backend_test_results.json', 'w') as f:
        json.dump(results, f, indent=2)
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())