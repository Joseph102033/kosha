#!/usr/bin/env python3
"""
law.docx에서 조항 본문을 추출하는 스크립트
산업안전보건기준에 관한 규칙의 조항명과 본문을 매칭합니다.
"""

import docx
import re
import json
import csv
from pathlib import Path

def extract_articles_from_docx(docx_path):
    """
    law.docx에서 조항 정보를 추출합니다.

    Returns:
        list: [{"article_no": "제3조", "article_title": "전도의 방지", "article_text": "..."}, ...]
    """
    doc = docx.Document(docx_path)
    articles = []

    current_article_no = None
    current_article_title = None
    current_article_text = []

    # 조항 번호 패턴: 제1조, 제2조, ...
    article_pattern = re.compile(r'^제(\d+)조(?:의(\d+))?\s*\(([^)]+)\)')

    for para in doc.paragraphs:
        text = para.text.strip()

        if not text:
            continue

        # 조항 제목 감지
        match = article_pattern.match(text)
        if match:
            # 이전 조항 저장
            if current_article_no and current_article_text:
                articles.append({
                    "article_no": current_article_no,
                    "article_title": current_article_title,
                    "article_text": "\n".join(current_article_text).strip()
                })

            # 새 조항 시작
            article_num = match.group(1)
            sub_num = match.group(2)
            title = match.group(3)

            if sub_num:
                current_article_no = f"제{article_num}조의{sub_num}"
            else:
                current_article_no = f"제{article_num}조"

            current_article_title = title
            current_article_text = []
        else:
            # 조항 본문 수집
            if current_article_no:
                current_article_text.append(text)

    # 마지막 조항 저장
    if current_article_no and current_article_text:
        articles.append({
            "article_no": current_article_no,
            "article_title": current_article_title,
            "article_text": "\n".join(current_article_text).strip()
        })

    return articles


def match_with_csv(articles, csv_path):
    """
    추출된 조항을 law_rules_extracted.csv와 매칭합니다.

    Returns:
        list: [{"id": "...", "keyword": "...", "law_title": "...", "article_text": "..."}, ...]
    """
    # CSV 읽기
    law_rules = []
    with open(csv_path, 'r', encoding='utf-8-sig') as f:
        reader = csv.DictReader(f)
        for row in reader:
            law_rules.append(row)

    # 조항 본문 매칭
    updated_rules = []
    for rule in law_rules:
        law_title = rule['law_title']

        # 조항 번호 추출 (예: "산업안전보건기준에 관한 규칙 제3조 (전도의 방지)" → "제3조")
        article_match = re.search(r'(제\d+조(?:의\d+)?)', law_title)
        if not article_match:
            # 조항 번호가 없으면 본문 없이 추가
            updated_rules.append({
                **rule,
                'article_text': None
            })
            continue

        article_no = article_match.group(1)

        # 조항 본문 찾기
        article_text = None
        for article in articles:
            if article['article_no'] == article_no:
                article_text = article['article_text']
                break

        updated_rules.append({
            **rule,
            'article_text': article_text
        })

    return updated_rules


def main():
    script_dir = Path(__file__).parent.parent
    docx_path = script_dir / 'law.docx'
    csv_path = script_dir / 'law_rules_extracted.csv'
    output_path = script_dir / 'law_rules_with_text.json'

    print(f"[INFO] Reading {docx_path}...")
    articles = extract_articles_from_docx(docx_path)
    print(f"[OK] Extracted {len(articles)} articles")

    # 샘플 출력
    print("\n[INFO] Sample articles:")
    for i, article in enumerate(articles[:3]):
        print(f"\n{i+1}. {article['article_no']} ({article['article_title']})")
        print(f"   Text: {article['article_text'][:100]}...")

    print(f"\n[INFO] Matching with {csv_path}...")
    updated_rules = match_with_csv(articles, csv_path)

    # 통계
    with_text = sum(1 for rule in updated_rules if rule['article_text'])
    without_text = len(updated_rules) - with_text

    print(f"\n[OK] Matching complete:")
    print(f"   - Total rules: {len(updated_rules)}")
    print(f"   - With article text: {with_text}")
    print(f"   - Without article text: {without_text}")

    # JSON 저장
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(updated_rules, f, ensure_ascii=False, indent=2)

    print(f"\n[SAVE] Saved to {output_path}")

    # SQL UPDATE 문 생성 (샘플)
    sql_output_path = script_dir / 'law_rules_update_text.sql'
    with open(sql_output_path, 'w', encoding='utf-8') as f:
        f.write("-- Update law_rules with article_text\n")
        f.write("-- Total: {} updates\n\n".format(with_text))

        for rule in updated_rules[:5]:  # 샘플 5개만
            if rule['article_text']:
                # SQL 이스케이프
                text = rule['article_text'].replace("'", "''")
                law_title = rule['law_title'].replace("'", "''")

                f.write(f"UPDATE law_rules SET article_text = '{text}' WHERE law_title = '{law_title}';\n")

        f.write("\n-- ... ({} more updates)\n".format(with_text - 5))

    print(f"[SAVE] SQL sample saved to {sql_output_path}")
    print("\n[DONE] Complete!")


if __name__ == '__main__':
    main()
