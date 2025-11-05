#!/usr/bin/env python3
"""
law_rules_with_text.json에서 D1 UPDATE SQL을 생성합니다.
"""

import json
from pathlib import Path

def escape_sql_string(text):
    """SQL 문자열 이스케이프 (작은따옴표)"""
    if text is None:
        return "NULL"
    return "'" + text.replace("'", "''").replace("\n", "\\n") + "'"

def generate_update_sql(json_path, output_path):
    """
    JSON에서 UPDATE SQL 생성
    """
    with open(json_path, 'r', encoding='utf-8') as f:
        rules = json.load(f)

    with open(output_path, 'w', encoding='utf-8') as f:
        f.write("-- Update law_rules with article_text from law.docx\n")
        f.write("-- Auto-generated from law_rules_with_text.json\n\n")

        update_count = 0
        skip_count = 0

        for rule in rules:
            article_text = rule.get('article_text')

            if not article_text or article_text.strip() == "":
                skip_count += 1
                continue

            law_title = rule['law_title']
            keyword = rule['keyword']

            # UPDATE 문 생성
            escaped_text = escape_sql_string(article_text)
            escaped_title = escape_sql_string(law_title)
            escaped_keyword = escape_sql_string(keyword)

            f.write(f"UPDATE law_rules SET article_text = {escaped_text} ")
            f.write(f"WHERE law_title = {escaped_title} AND keyword = {escaped_keyword};\n")

            update_count += 1

        f.write(f"\n-- Updated {update_count} records\n")
        f.write(f"-- Skipped {skip_count} records (no article text)\n")

    return update_count, skip_count


def main():
    script_dir = Path(__file__).parent.parent
    json_path = script_dir / 'law_rules_with_text.json'
    output_path = script_dir / 'law_rules_update_full.sql'

    print(f"[INFO] Reading {json_path}...")
    update_count, skip_count = generate_update_sql(json_path, output_path)

    print(f"\n[OK] SQL generation complete:")
    print(f"   - Updated records: {update_count}")
    print(f"   - Skipped records: {skip_count}")
    print(f"\n[SAVE] Saved to {output_path}")
    print(f"\n[NEXT] To apply to D1, run:")
    print(f"   cd apps/workers")
    print(f"   CLOUDFLARE_API_TOKEN=xxx npx wrangler d1 execute safe-ops-studio-db --remote --file=../../law_rules_update_full.sql")


if __name__ == '__main__':
    main()
