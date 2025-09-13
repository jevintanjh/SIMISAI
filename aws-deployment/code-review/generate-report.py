#!/usr/bin/env python3

"""
System Architect Review Report Generator
Generates comprehensive HTML and JSON reports from review results
"""

import json
import os
import sys
from datetime import datetime
from pathlib import Path

class ReviewReportGenerator:
    def __init__(self, config_file="aws-deployment/code-review/review-config.json"):
        self.config = self.load_config(config_file)
        self.report_data = {
            "timestamp": datetime.now().isoformat(),
            "review_id": f"review_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            "checks": {},
            "summary": {},
            "recommendations": []
        }
    
    def load_config(self, config_file):
        """Load review configuration"""
        try:
            with open(config_file, 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            print(f"⚠️  Configuration file not found: {config_file}")
            return {"review": {"enabled": True}}
    
    def parse_review_output(self, output_file=None):
        """Parse review output from file or stdin"""
        if output_file and os.path.exists(output_file):
            with open(output_file, 'r') as f:
                content = f.read()
        else:
            content = sys.stdin.read()
        
        # Parse the review output
        lines = content.split('\n')
        current_check = None
        
        for line in lines:
            if '[🔍 REVIEW]' in line:
                current_check = line.split(']')[1].strip()
                self.report_data["checks"][current_check] = {
                    "status": "pending",
                    "items": [],
                    "passed": 0,
                    "failed": 0,
                    "warnings": 0
                }
            elif '[✅ PASS]' in line:
                if current_check:
                    self.report_data["checks"][current_check]["items"].append({
                        "type": "pass",
                        "message": line.split(']')[1].strip()
                    })
                    self.report_data["checks"][current_check]["passed"] += 1
            elif '[❌ FAIL]' in line:
                if current_check:
                    self.report_data["checks"][current_check]["items"].append({
                        "type": "fail",
                        "message": line.split(']')[1].strip()
                    })
                    self.report_data["checks"][current_check]["failed"] += 1
            elif '[⚠️  WARN]' in line:
                if current_check:
                    self.report_data["checks"][current_check]["items"].append({
                        "type": "warning",
                        "message": line.split(']')[1].strip()
                    })
                    self.report_data["checks"][current_check]["warnings"] += 1
        
        # Calculate summary
        self.calculate_summary()
    
    def calculate_summary(self):
        """Calculate review summary"""
        total_checks = 0
        total_passed = 0
        total_failed = 0
        total_warnings = 0
        
        for check_name, check_data in self.report_data["checks"].items():
            total_checks += check_data["passed"] + check_data["failed"] + check_data["warnings"]
            total_passed += check_data["passed"]
            total_failed += check_data["failed"]
            total_warnings += check_data["warnings"]
        
        self.report_data["summary"] = {
            "total_checks": total_checks,
            "passed": total_passed,
            "failed": total_failed,
            "warnings": total_warnings,
            "success_rate": (total_passed / total_checks * 100) if total_checks > 0 else 0,
            "overall_status": self.determine_overall_status(total_passed, total_failed, total_warnings)
        }
        
        # Generate recommendations
        self.generate_recommendations()
    
    def determine_overall_status(self, passed, failed, warnings):
        """Determine overall review status"""
        if failed > 0:
            return "FAILED"
        elif warnings > 5:
            return "WARNING"
        elif passed > 0:
            return "PASSED"
        else:
            return "UNKNOWN"
    
    def generate_recommendations(self):
        """Generate recommendations based on review results"""
        recommendations = []
        
        for check_name, check_data in self.report_data["checks"].items():
            if check_data["failed"] > 0:
                recommendations.append({
                    "priority": "HIGH",
                    "category": check_name,
                    "message": f"Fix {check_data['failed']} failed checks in {check_name}",
                    "action": f"Review and fix the failed items in {check_name}"
                })
            
            if check_data["warnings"] > 3:
                recommendations.append({
                    "priority": "MEDIUM",
                    "category": check_name,
                    "message": f"Address {check_data['warnings']} warnings in {check_name}",
                    "action": f"Review and address the warnings in {check_name}"
                })
        
        # Add general recommendations
        if self.report_data["summary"]["success_rate"] < 80:
            recommendations.append({
                "priority": "HIGH",
                "category": "OVERALL",
                "message": "Success rate is below 80%",
                "action": "Review all failed checks and improve code quality"
            })
        
        self.report_data["recommendations"] = recommendations
    
    def generate_html_report(self):
        """Generate HTML report"""
        html_content = f"""
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>System Architect Review Report</title>
    <style>
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }}
        .container {{
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            overflow: hidden;
        }}
        .header {{
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }}
        .header h1 {{
            margin: 0;
            font-size: 2.5em;
            font-weight: 300;
        }}
        .header p {{
            margin: 10px 0 0 0;
            opacity: 0.9;
        }}
        .summary {{
            padding: 30px;
            border-bottom: 1px solid #eee;
        }}
        .summary-grid {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }}
        .summary-card {{
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            border-left: 4px solid #007bff;
        }}
        .summary-card h3 {{
            margin: 0 0 10px 0;
            color: #333;
        }}
        .summary-card .number {{
            font-size: 2em;
            font-weight: bold;
            color: #007bff;
        }}
        .status-badge {{
            display: inline-block;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: bold;
            text-transform: uppercase;
            font-size: 0.9em;
        }}
        .status-passed {{
            background: #d4edda;
            color: #155724;
        }}
        .status-failed {{
            background: #f8d7da;
            color: #721c24;
        }}
        .status-warning {{
            background: #fff3cd;
            color: #856404;
        }}
        .checks {{
            padding: 30px;
        }}
        .check-section {{
            margin-bottom: 30px;
        }}
        .check-header {{
            background: #f8f9fa;
            padding: 15px 20px;
            border-radius: 8px 8px 0 0;
            border-bottom: 1px solid #dee2e6;
            font-weight: bold;
            font-size: 1.1em;
        }}
        .check-items {{
            background: white;
            border: 1px solid #dee2e6;
            border-top: none;
            border-radius: 0 0 8px 8px;
        }}
        .check-item {{
            padding: 15px 20px;
            border-bottom: 1px solid #f1f3f4;
            display: flex;
            align-items: center;
        }}
        .check-item:last-child {{
            border-bottom: none;
        }}
        .check-item.pass {{
            background: #f8fff8;
        }}
        .check-item.fail {{
            background: #fff8f8;
        }}
        .check-item.warning {{
            background: #fffef8;
        }}
        .check-icon {{
            margin-right: 15px;
            font-size: 1.2em;
        }}
        .recommendations {{
            padding: 30px;
            background: #f8f9fa;
        }}
        .recommendation {{
            background: white;
            padding: 20px;
            margin-bottom: 15px;
            border-radius: 8px;
            border-left: 4px solid #ffc107;
        }}
        .recommendation.high {{
            border-left-color: #dc3545;
        }}
        .recommendation.medium {{
            border-left-color: #ffc107;
        }}
        .recommendation.low {{
            border-left-color: #28a745;
        }}
        .footer {{
            padding: 20px 30px;
            background: #f8f9fa;
            text-align: center;
            color: #6c757d;
            border-top: 1px solid #dee2e6;
        }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏗️ System Architect Review Report</h1>
            <p>Generated on {datetime.now().strftime('%B %d, %Y at %I:%M %p')}</p>
        </div>
        
        <div class="summary">
            <h2>📊 Summary</h2>
            <div class="summary-grid">
                <div class="summary-card">
                    <h3>Total Checks</h3>
                    <div class="number">{self.report_data['summary']['total_checks']}</div>
                </div>
                <div class="summary-card">
                    <h3>Passed</h3>
                    <div class="number" style="color: #28a745;">{self.report_data['summary']['passed']}</div>
                </div>
                <div class="summary-card">
                    <h3>Failed</h3>
                    <div class="number" style="color: #dc3545;">{self.report_data['summary']['failed']}</div>
                </div>
                <div class="summary-card">
                    <h3>Warnings</h3>
                    <div class="number" style="color: #ffc107;">{self.report_data['summary']['warnings']}</div>
                </div>
                <div class="summary-card">
                    <h3>Success Rate</h3>
                    <div class="number" style="color: #007bff;">{self.report_data['summary']['success_rate']:.1f}%</div>
                </div>
            </div>
            <div style="text-align: center; margin-top: 20px;">
                <span class="status-badge status-{self.report_data['summary']['overall_status'].lower()}">
                    {self.report_data['summary']['overall_status']}
                </span>
            </div>
        </div>
        
        <div class="checks">
            <h2>🔍 Detailed Checks</h2>
"""
        
        # Add check sections
        for check_name, check_data in self.report_data["checks"].items():
            html_content += f"""
            <div class="check-section">
                <div class="check-header">
                    {check_name} ({check_data['passed']} passed, {check_data['failed']} failed, {check_data['warnings']} warnings)
                </div>
                <div class="check-items">
"""
            
            for item in check_data["items"]:
                icon = "✅" if item["type"] == "pass" else "❌" if item["type"] == "fail" else "⚠️"
                html_content += f"""
                    <div class="check-item {item['type']}">
                        <span class="check-icon">{icon}</span>
                        <span>{item['message']}</span>
                    </div>
"""
            
            html_content += """
                </div>
            </div>
"""
        
        # Add recommendations
        if self.report_data["recommendations"]:
            html_content += """
        </div>
        
        <div class="recommendations">
            <h2>💡 Recommendations</h2>
"""
            
            for rec in self.report_data["recommendations"]:
                html_content += f"""
            <div class="recommendation {rec['priority'].lower()}">
                <h4>{rec['priority']} Priority: {rec['category']}</h4>
                <p><strong>Issue:</strong> {rec['message']}</p>
                <p><strong>Action:</strong> {rec['action']}</p>
            </div>
"""
        
        html_content += """
        </div>
        
        <div class="footer">
            <p>Generated by System Architect Review System</p>
            <p>For questions or issues, contact the development team</p>
        </div>
    </div>
</body>
</html>
"""
        
        return html_content
    
    def generate_json_report(self):
        """Generate JSON report"""
        return json.dumps(self.report_data, indent=2)
    
    def save_reports(self):
        """Save reports to files"""
        # Create reports directory
        reports_dir = Path("aws-deployment/code-review/reports")
        reports_dir.mkdir(exist_ok=True)
        
        # Generate timestamp for filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        # Save HTML report
        if self.config.get("reports", {}).get("generate_html", True):
            html_file = reports_dir / f"review_report_{timestamp}.html"
            with open(html_file, 'w') as f:
                f.write(self.generate_html_report())
            print(f"📄 HTML report saved: {html_file}")
        
        # Save JSON report
        if self.config.get("reports", {}).get("generate_json", True):
            json_file = reports_dir / f"review_report_{timestamp}.json"
            with open(json_file, 'w') as f:
                f.write(self.generate_json_report())
            print(f"📊 JSON report saved: {json_file}")
        
        # Save summary
        summary_file = reports_dir / f"review_summary_{timestamp}.txt"
        with open(summary_file, 'w') as f:
            f.write(f"System Architect Review Summary\n")
            f.write(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
            f.write(f"Overall Status: {self.report_data['summary']['overall_status']}\n")
            f.write(f"Success Rate: {self.report_data['summary']['success_rate']:.1f}%\n")
            f.write(f"Total Checks: {self.report_data['summary']['total_checks']}\n")
            f.write(f"Passed: {self.report_data['summary']['passed']}\n")
            f.write(f"Failed: {self.report_data['summary']['failed']}\n")
            f.write(f"Warnings: {self.report_data['summary']['warnings']}\n")
        print(f"📋 Summary saved: {summary_file}")

def main():
    """Main function"""
    import argparse
    
    parser = argparse.ArgumentParser(description="Generate System Architect Review Reports")
    parser.add_argument("--input", "-i", help="Input file with review output")
    parser.add_argument("--config", "-c", default="aws-deployment/code-review/review-config.json", help="Configuration file")
    parser.add_argument("--output", "-o", help="Output directory for reports")
    
    args = parser.parse_args()
    
    # Initialize report generator
    generator = ReviewReportGenerator(args.config)
    
    # Parse review output
    generator.parse_review_output(args.input)
    
    # Save reports
    generator.save_reports()
    
    # Print summary
    print("\n📊 Review Summary:")
    print(f"Overall Status: {generator.report_data['summary']['overall_status']}")
    print(f"Success Rate: {generator.report_data['summary']['success_rate']:.1f}%")
    print(f"Total Checks: {generator.report_data['summary']['total_checks']}")
    print(f"Passed: {generator.report_data['summary']['passed']}")
    print(f"Failed: {generator.report_data['summary']['failed']}")
    print(f"Warnings: {generator.report_data['summary']['warnings']}")
    
    if generator.report_data["recommendations"]:
        print(f"\n💡 Recommendations: {len(generator.report_data['recommendations'])}")
        for rec in generator.report_data["recommendations"]:
            print(f"  {rec['priority']}: {rec['message']}")

if __name__ == "__main__":
    main()
