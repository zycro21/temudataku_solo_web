-- Article: content block system
ALTER TABLE "article_content_blocks" RENAME TO "ct_article_content_blocks";
ALTER TABLE "ArticleHeadingContent" RENAME TO "ct_article_heading_contents";
ALTER TABLE "ArticleParagraphContent" RENAME TO "ct_article_paragraph_contents";
ALTER TABLE "ArticleHighlightContent" RENAME TO "ct_article_highlight_contents";
ALTER TABLE "article_table_contents" RENAME TO "ct_article_table_contents";
ALTER TABLE "article_table_columns" RENAME TO "ct_article_table_columns";
ALTER TABLE "article_table_rows" RENAME TO "ct_article_table_rows";
ALTER TABLE "article_table_cells" RENAME TO "ct_article_table_cells";
ALTER TABLE "article_divider_contents" RENAME TO "ct_article_divider_contents";
ALTER TABLE "article_link_contents" RENAME TO "ct_article_link_contents";
ALTER TABLE "article_table_of_content_contents" RENAME TO "ct_article_table_of_content_contents";
ALTER TABLE "article_table_of_content_items" RENAME TO "ct_article_table_of_content_items";
ALTER TABLE "article_additional_contents" RENAME TO "ct_article_additional_contents";
ALTER TABLE "article_image_video_contents" RENAME TO "ct_article_image_video_contents";

-- E-Learning: content block system
ALTER TABLE "e_learning_content_blocks" RENAME TO "ct_e_learning_content_blocks";
ALTER TABLE "ELearningHeadingContent" RENAME TO "ct_e_learning_heading_contents";
ALTER TABLE "ELearningParagraphContent" RENAME TO "ct_e_learning_paragraph_contents";
ALTER TABLE "ELearningHighlightContent" RENAME TO "ct_e_learning_highlight_contents";
ALTER TABLE "ELearningAccordionContent" RENAME TO "ct_e_learning_accordion_contents";
ALTER TABLE "ELearningAccordionItem" RENAME TO "ct_e_learning_accordion_items";
ALTER TABLE "ELearningCarouselContent" RENAME TO "ct_e_learning_carousel_contents";
ALTER TABLE "ELearningCarouselItem" RENAME TO "ct_e_learning_carousel_items";
ALTER TABLE "ELearningContentCardContent" RENAME TO "ct_e_learning_content_card_contents";
ALTER TABLE "ELearningContentCardItem" RENAME TO "ct_e_learning_content_card_items";
ALTER TABLE "ELearningTabNavigationContent" RENAME TO "ct_e_learning_tab_navigation_contents";
ALTER TABLE "ELearningTabItem" RENAME TO "ct_e_learning_tab_items";
ALTER TABLE "ELearningSummaryContent" RENAME TO "ct_e_learning_summary_contents";
ALTER TABLE "ELearningSummaryComment" RENAME TO "ct_e_learning_summary_comments";

-- E-Learning: additional content system
ALTER TABLE "e_learning_additional_contents" RENAME TO "ct_e_learning_additional_contents";
ALTER TABLE "ELearningMultipleChoiceQuestion" RENAME TO "ct_e_learning_multiple_choice_questions";
ALTER TABLE "ELearningMultipleChoiceOption" RENAME TO "ct_e_learning_multiple_choice_options";
ALTER TABLE "e_learning_matching_questions" RENAME TO "ct_e_learning_matching_questions";
ALTER TABLE "e_learning_matching_items" RENAME TO "ct_e_learning_matching_items";
ALTER TABLE "e_learning_image_video_contents" RENAME TO "ct_e_learning_image_video_contents";
ALTER TABLE "e_learning_executable_codes" RENAME TO "ct_e_learning_executable_codes";

-- E-Learning: quiz & assignment (soal/instruksi yang dibuat admin)
ALTER TABLE "e_learning_quizzes" RENAME TO "ct_e_learning_quizzes";
ALTER TABLE "e_learning_questions" RENAME TO "ct_e_learning_questions";
ALTER TABLE "e_learning_assignments" RENAME TO "ct_e_learning_assignments";
ALTER TABLE "e_learning_assignment_instructions" RENAME TO "ct_e_learning_assignment_instructions";
ALTER TABLE "e_learning_assignment_supporting_files" RENAME TO "ct_e_learning_assignment_supporting_files";