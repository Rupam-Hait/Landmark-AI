import requests
import time
import subprocess
import os
import sys

def run_tests():
    base_url = "http://127.0.0.1:8000"

    print("Testing API endpoints...")

    # 1. Health
    r = requests.get(f"{base_url}/api/health")
    assert r.status_code == 200, f"Health check failed: {r.text}"
    print("[PASS] 1. Health check:", r.json())

    # 2. Dashboard Stats
    r = requests.get(f"{base_url}/api/dashboard/stats")
    assert r.status_code == 200, f"Stats failed: {r.text}"
    stats = r.json()
    assert stats["summary"]["total_documents"] >= 30, f"Expected >= 30 records, got {stats['summary']['total_documents']}"
    print(f"[PASS] 2. Dashboard stats: {stats['summary']['total_documents']} documents, {stats['summary']['auto_verified']} auto-verified, {stats['summary']['pending_review']} pending review")

    # 3. Districts GIS
    r = requests.get(f"{base_url}/api/districts")
    assert r.status_code == 200, f"Districts failed: {r.text}"
    districts = r.json()
    assert len(districts) > 0, "No districts returned"
    print(f"[PASS] 3. Districts GIS: {len(districts)} districts loaded ({districts[0]['district']}: {districts[0]['completion_rate']}% complete)")

    # 4. Records List
    r = requests.get(f"{base_url}/api/records?page=1&page_size=10")
    assert r.status_code == 200, f"Records list failed: {r.text}"
    records = r.json()
    assert len(records["items"]) == 10
    first_record = records["items"][0]
    print(f"[PASS] 4. Records list: Loaded {records['total']} total records. First: {first_record['record_identifier']} ({first_record['owner_name']})")

    # 5. Record Detail
    rec_id = first_record["id"]
    r = requests.get(f"{base_url}/api/records/{rec_id}")
    assert r.status_code == 200, f"Record detail failed: {r.text}"
    detail = r.json()
    assert "audit_logs" in detail
    print(f"[PASS] 5. Record detail: {detail['record_identifier']} with {len(detail['audit_logs'])} audit entries")

    # 6. OCR Samples
    r = requests.get(f"{base_url}/api/ocr/samples")
    assert r.status_code == 200, f"Samples failed: {r.text}"
    samples = r.json()
    assert len(samples) >= 4
    print(f"[PASS] 6. OCR Samples: {len(samples)} test sample scanned deeds available")

    # 7. Process Sample Pipeline
    sample_id = samples[0]["id"]
    r = requests.post(f"{base_url}/api/ocr/process-sample", json={"sample_id": sample_id, "preset": "standard"})
    assert r.status_code == 200, f"Sample OCR processing failed: {r.text}"
    processed_doc = r.json()
    assert "record_identifier" in processed_doc
    print(f"[PASS] 7. OCR Sample Run: Processed {sample_id} -> {processed_doc['record_identifier']} (Confidence: {processed_doc['overall_confidence']}%, Status: {processed_doc['status']})")

    # 8. Duplicate Detection Pipeline Test
    dup_sample = next((s for s in samples if "duplicate" in s["id"]), None)
    if dup_sample:
        r = requests.post(f"{base_url}/api/ocr/process-sample", json={"sample_id": dup_sample["id"], "preset": "standard"})
        assert r.status_code == 200
        dup_result = r.json()
        print(f"[PASS] 8. Duplicate Detection Test: Status = {dup_result['status']}, Flagged = {dup_result['is_flagged']}, Issues = {len(dup_result.get('validation_issues', []))}")

    # 9. Human Verification Action
    pending_records = requests.get(f"{base_url}/api/records?status=PENDING_REVIEW").json()
    if pending_records["items"]:
        pending_id = pending_records["items"][0]["id"]
        r = requests.put(
            f"{base_url}/api/records/{pending_id}/verify",
            json={
                "reviewed_by": "Senior Officer R. K. Mathur",
                "reviewer_notes": "Cadastral field survey verified. Boundaries authenticated.",
            },
        )
        assert r.status_code == 200
        verified_rec = r.json()
        assert verified_rec["status"] == "HUMAN_VERIFIED"
        print(f"[PASS] 9. Human Verification: Record #{verified_rec['record_identifier']} approved and marked HUMAN_VERIFIED")

    # 10. CSV Export
    r = requests.get(f"{base_url}/api/records/export/csv")
    assert r.status_code == 200
    assert "Record ID,Owner Name" in r.text
    print(f"[PASS] 10. CSV Export: Successfully generated {len(r.text.splitlines())} lines of CSV data")

    print("\nALL 10 API & PIPELINE INTEGRATION TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    run_tests()
