-- AlterTable
ALTER TABLE "ct_article_additional_contents" RENAME CONSTRAINT "article_additional_contents_pkey" TO "ct_article_additional_contents_pkey";

-- AlterTable
ALTER TABLE "ct_article_content_blocks" RENAME CONSTRAINT "article_content_blocks_pkey" TO "ct_article_content_blocks_pkey";

-- AlterTable
ALTER TABLE "ct_article_divider_contents" RENAME CONSTRAINT "article_divider_contents_pkey" TO "ct_article_divider_contents_pkey";

-- AlterTable
ALTER TABLE "ct_article_heading_contents" RENAME CONSTRAINT "ArticleHeadingContent_pkey" TO "ct_article_heading_contents_pkey";

-- AlterTable
ALTER TABLE "ct_article_highlight_contents" RENAME CONSTRAINT "ArticleHighlightContent_pkey" TO "ct_article_highlight_contents_pkey";

-- AlterTable
ALTER TABLE "ct_article_image_video_contents" RENAME CONSTRAINT "article_image_video_contents_pkey" TO "ct_article_image_video_contents_pkey";

-- AlterTable
ALTER TABLE "ct_article_link_contents" RENAME CONSTRAINT "article_link_contents_pkey" TO "ct_article_link_contents_pkey";

-- AlterTable
ALTER TABLE "ct_article_paragraph_contents" RENAME CONSTRAINT "ArticleParagraphContent_pkey" TO "ct_article_paragraph_contents_pkey";

-- AlterTable
ALTER TABLE "ct_article_table_cells" RENAME CONSTRAINT "article_table_cells_pkey" TO "ct_article_table_cells_pkey";

-- AlterTable
ALTER TABLE "ct_article_table_columns" RENAME CONSTRAINT "article_table_columns_pkey" TO "ct_article_table_columns_pkey";

-- AlterTable
ALTER TABLE "ct_article_table_contents" RENAME CONSTRAINT "article_table_contents_pkey" TO "ct_article_table_contents_pkey";

-- AlterTable
ALTER TABLE "ct_article_table_of_content_contents" RENAME CONSTRAINT "article_table_of_content_contents_pkey" TO "ct_article_table_of_content_contents_pkey";

-- AlterTable
ALTER TABLE "ct_article_table_of_content_items" RENAME CONSTRAINT "article_table_of_content_items_pkey" TO "ct_article_table_of_content_items_pkey";

-- AlterTable
ALTER TABLE "ct_article_table_rows" RENAME CONSTRAINT "article_table_rows_pkey" TO "ct_article_table_rows_pkey";

-- AlterTable
ALTER TABLE "ct_e_learning_accordion_contents" RENAME CONSTRAINT "ELearningAccordionContent_pkey" TO "ct_e_learning_accordion_contents_pkey";

-- AlterTable
ALTER TABLE "ct_e_learning_accordion_items" RENAME CONSTRAINT "ELearningAccordionItem_pkey" TO "ct_e_learning_accordion_items_pkey";

-- AlterTable
ALTER TABLE "ct_e_learning_additional_contents" RENAME CONSTRAINT "e_learning_additional_contents_pkey" TO "ct_e_learning_additional_contents_pkey";

-- AlterTable
ALTER TABLE "ct_e_learning_assignment_instructions" RENAME CONSTRAINT "e_learning_assignment_instructions_pkey" TO "ct_e_learning_assignment_instructions_pkey";

-- AlterTable
ALTER TABLE "ct_e_learning_assignment_supporting_files" RENAME CONSTRAINT "e_learning_assignment_supporting_files_pkey" TO "ct_e_learning_assignment_supporting_files_pkey";

-- AlterTable
ALTER TABLE "ct_e_learning_assignments" RENAME CONSTRAINT "e_learning_assignments_pkey" TO "ct_e_learning_assignments_pkey";

-- AlterTable
ALTER TABLE "ct_e_learning_carousel_contents" RENAME CONSTRAINT "ELearningCarouselContent_pkey" TO "ct_e_learning_carousel_contents_pkey";

-- AlterTable
ALTER TABLE "ct_e_learning_carousel_items" RENAME CONSTRAINT "ELearningCarouselItem_pkey" TO "ct_e_learning_carousel_items_pkey";

-- AlterTable
ALTER TABLE "ct_e_learning_content_blocks" RENAME CONSTRAINT "e_learning_content_blocks_pkey" TO "ct_e_learning_content_blocks_pkey";

-- AlterTable
ALTER TABLE "ct_e_learning_content_card_contents" RENAME CONSTRAINT "ELearningContentCardContent_pkey" TO "ct_e_learning_content_card_contents_pkey";

-- AlterTable
ALTER TABLE "ct_e_learning_content_card_items" RENAME CONSTRAINT "ELearningContentCardItem_pkey" TO "ct_e_learning_content_card_items_pkey";

-- AlterTable
ALTER TABLE "ct_e_learning_executable_codes" RENAME CONSTRAINT "e_learning_executable_codes_pkey" TO "ct_e_learning_executable_codes_pkey";

-- AlterTable
ALTER TABLE "ct_e_learning_heading_contents" RENAME CONSTRAINT "ELearningHeadingContent_pkey" TO "ct_e_learning_heading_contents_pkey";

-- AlterTable
ALTER TABLE "ct_e_learning_highlight_contents" RENAME CONSTRAINT "ELearningHighlightContent_pkey" TO "ct_e_learning_highlight_contents_pkey";

-- AlterTable
ALTER TABLE "ct_e_learning_image_video_contents" RENAME CONSTRAINT "e_learning_image_video_contents_pkey" TO "ct_e_learning_image_video_contents_pkey";

-- AlterTable
ALTER TABLE "ct_e_learning_matching_items" RENAME CONSTRAINT "e_learning_matching_items_pkey" TO "ct_e_learning_matching_items_pkey";

-- AlterTable
ALTER TABLE "ct_e_learning_matching_questions" RENAME CONSTRAINT "e_learning_matching_questions_pkey" TO "ct_e_learning_matching_questions_pkey";

-- AlterTable
ALTER TABLE "ct_e_learning_multiple_choice_options" RENAME CONSTRAINT "ELearningMultipleChoiceOption_pkey" TO "ct_e_learning_multiple_choice_options_pkey";

-- AlterTable
ALTER TABLE "ct_e_learning_multiple_choice_questions" RENAME CONSTRAINT "ELearningMultipleChoiceQuestion_pkey" TO "ct_e_learning_multiple_choice_questions_pkey";

-- AlterTable
ALTER TABLE "ct_e_learning_paragraph_contents" RENAME CONSTRAINT "ELearningParagraphContent_pkey" TO "ct_e_learning_paragraph_contents_pkey";

-- AlterTable
ALTER TABLE "ct_e_learning_questions" RENAME CONSTRAINT "e_learning_questions_pkey" TO "ct_e_learning_questions_pkey";

-- AlterTable
ALTER TABLE "ct_e_learning_quizzes" RENAME CONSTRAINT "e_learning_quizzes_pkey" TO "ct_e_learning_quizzes_pkey";

-- AlterTable
ALTER TABLE "ct_e_learning_summary_comments" RENAME CONSTRAINT "ELearningSummaryComment_pkey" TO "ct_e_learning_summary_comments_pkey";

-- AlterTable
ALTER TABLE "ct_e_learning_summary_contents" RENAME CONSTRAINT "ELearningSummaryContent_pkey" TO "ct_e_learning_summary_contents_pkey";

-- AlterTable
ALTER TABLE "ct_e_learning_tab_items" RENAME CONSTRAINT "ELearningTabItem_pkey" TO "ct_e_learning_tab_items_pkey";

-- AlterTable
ALTER TABLE "ct_e_learning_tab_navigation_contents" RENAME CONSTRAINT "ELearningTabNavigationContent_pkey" TO "ct_e_learning_tab_navigation_contents_pkey";

-- RenameForeignKey
ALTER TABLE "ct_article_additional_contents" RENAME CONSTRAINT "article_additional_contents_block_id_fkey" TO "ct_article_additional_contents_block_id_fkey";

-- RenameForeignKey
ALTER TABLE "ct_article_content_blocks" RENAME CONSTRAINT "article_content_blocks_block_id_fkey" TO "ct_article_content_blocks_block_id_fkey";

-- RenameForeignKey
ALTER TABLE "ct_article_divider_contents" RENAME CONSTRAINT "article_divider_contents_contentId_fkey" TO "ct_article_divider_contents_contentId_fkey";

-- RenameForeignKey
ALTER TABLE "ct_article_heading_contents" RENAME CONSTRAINT "ArticleHeadingContent_contentId_fkey" TO "ct_article_heading_contents_contentId_fkey";

-- RenameForeignKey
ALTER TABLE "ct_article_highlight_contents" RENAME CONSTRAINT "ArticleHighlightContent_contentId_fkey" TO "ct_article_highlight_contents_contentId_fkey";

-- RenameForeignKey
ALTER TABLE "ct_article_image_video_contents" RENAME CONSTRAINT "article_image_video_contents_additionalContentId_fkey" TO "ct_article_image_video_contents_additionalContentId_fkey";

-- RenameForeignKey
ALTER TABLE "ct_article_link_contents" RENAME CONSTRAINT "article_link_contents_contentId_fkey" TO "ct_article_link_contents_contentId_fkey";

-- RenameForeignKey
ALTER TABLE "ct_article_link_contents" RENAME CONSTRAINT "article_link_contents_target_additional_content_id_fkey" TO "ct_article_link_contents_target_additional_content_id_fkey";

-- RenameForeignKey
ALTER TABLE "ct_article_link_contents" RENAME CONSTRAINT "article_link_contents_target_content_block_id_fkey" TO "ct_article_link_contents_target_content_block_id_fkey";

-- RenameForeignKey
ALTER TABLE "ct_article_paragraph_contents" RENAME CONSTRAINT "ArticleParagraphContent_contentId_fkey" TO "ct_article_paragraph_contents_contentId_fkey";

-- RenameForeignKey
ALTER TABLE "ct_article_table_cells" RENAME CONSTRAINT "article_table_cells_column_id_fkey" TO "ct_article_table_cells_column_id_fkey";

-- RenameForeignKey
ALTER TABLE "ct_article_table_cells" RENAME CONSTRAINT "article_table_cells_row_id_fkey" TO "ct_article_table_cells_row_id_fkey";

-- RenameForeignKey
ALTER TABLE "ct_article_table_columns" RENAME CONSTRAINT "article_table_columns_table_id_fkey" TO "ct_article_table_columns_table_id_fkey";

-- RenameForeignKey
ALTER TABLE "ct_article_table_contents" RENAME CONSTRAINT "article_table_contents_contentId_fkey" TO "ct_article_table_contents_contentId_fkey";

-- RenameForeignKey
ALTER TABLE "ct_article_table_of_content_contents" RENAME CONSTRAINT "article_table_of_content_contents_article_id_fkey" TO "ct_article_table_of_content_contents_article_id_fkey";

-- RenameForeignKey
ALTER TABLE "ct_article_table_of_content_contents" RENAME CONSTRAINT "article_table_of_content_contents_contentId_fkey" TO "ct_article_table_of_content_contents_contentId_fkey";

-- RenameForeignKey
ALTER TABLE "ct_article_table_of_content_items" RENAME CONSTRAINT "article_table_of_content_items_target_additional_content_i_fkey" TO "ct_article_table_of_content_items_target_additional_conten_fkey";

-- RenameForeignKey
ALTER TABLE "ct_article_table_of_content_items" RENAME CONSTRAINT "article_table_of_content_items_target_content_block_id_fkey" TO "ct_article_table_of_content_items_target_content_block_id_fkey";

-- RenameForeignKey
ALTER TABLE "ct_article_table_of_content_items" RENAME CONSTRAINT "article_table_of_content_items_toc_id_fkey" TO "ct_article_table_of_content_items_toc_id_fkey";

-- RenameForeignKey
ALTER TABLE "ct_article_table_rows" RENAME CONSTRAINT "article_table_rows_table_id_fkey" TO "ct_article_table_rows_table_id_fkey";

-- RenameForeignKey
ALTER TABLE "ct_e_learning_accordion_contents" RENAME CONSTRAINT "ELearningAccordionContent_contentId_fkey" TO "ct_e_learning_accordion_contents_contentId_fkey";

-- RenameForeignKey
ALTER TABLE "ct_e_learning_accordion_items" RENAME CONSTRAINT "ELearningAccordionItem_accordionId_fkey" TO "ct_e_learning_accordion_items_accordionId_fkey";

-- RenameForeignKey
ALTER TABLE "ct_e_learning_additional_contents" RENAME CONSTRAINT "e_learning_additional_contents_block_id_fkey" TO "ct_e_learning_additional_contents_block_id_fkey";

-- RenameForeignKey
ALTER TABLE "ct_e_learning_assignment_instructions" RENAME CONSTRAINT "e_learning_assignment_instructions_assignment_id_fkey" TO "ct_e_learning_assignment_instructions_assignment_id_fkey";

-- RenameForeignKey
ALTER TABLE "ct_e_learning_assignment_supporting_files" RENAME CONSTRAINT "e_learning_assignment_supporting_files_assignment_id_fkey" TO "ct_e_learning_assignment_supporting_files_assignment_id_fkey";

-- RenameForeignKey
ALTER TABLE "ct_e_learning_assignments" RENAME CONSTRAINT "e_learning_assignments_text_id_fkey" TO "ct_e_learning_assignments_text_id_fkey";

-- RenameForeignKey
ALTER TABLE "ct_e_learning_carousel_contents" RENAME CONSTRAINT "ELearningCarouselContent_contentId_fkey" TO "ct_e_learning_carousel_contents_contentId_fkey";

-- RenameForeignKey
ALTER TABLE "ct_e_learning_carousel_items" RENAME CONSTRAINT "ELearningCarouselItem_carouselId_fkey" TO "ct_e_learning_carousel_items_carouselId_fkey";

-- RenameForeignKey
ALTER TABLE "ct_e_learning_content_blocks" RENAME CONSTRAINT "e_learning_content_blocks_block_id_fkey" TO "ct_e_learning_content_blocks_block_id_fkey";

-- RenameForeignKey
ALTER TABLE "ct_e_learning_content_card_contents" RENAME CONSTRAINT "ELearningContentCardContent_contentId_fkey" TO "ct_e_learning_content_card_contents_contentId_fkey";

-- RenameForeignKey
ALTER TABLE "ct_e_learning_content_card_items" RENAME CONSTRAINT "ELearningContentCardItem_cardId_fkey" TO "ct_e_learning_content_card_items_cardId_fkey";

-- RenameForeignKey
ALTER TABLE "ct_e_learning_executable_codes" RENAME CONSTRAINT "e_learning_executable_codes_additional_content_id_fkey" TO "ct_e_learning_executable_codes_additional_content_id_fkey";

-- RenameForeignKey
ALTER TABLE "ct_e_learning_heading_contents" RENAME CONSTRAINT "ELearningHeadingContent_contentId_fkey" TO "ct_e_learning_heading_contents_contentId_fkey";

-- RenameForeignKey
ALTER TABLE "ct_e_learning_highlight_contents" RENAME CONSTRAINT "ELearningHighlightContent_contentId_fkey" TO "ct_e_learning_highlight_contents_contentId_fkey";

-- RenameForeignKey
ALTER TABLE "ct_e_learning_image_video_contents" RENAME CONSTRAINT "e_learning_image_video_contents_additionalContentId_fkey" TO "ct_e_learning_image_video_contents_additionalContentId_fkey";

-- RenameForeignKey
ALTER TABLE "ct_e_learning_matching_items" RENAME CONSTRAINT "e_learning_matching_items_question_id_fkey" TO "ct_e_learning_matching_items_question_id_fkey";

-- RenameForeignKey
ALTER TABLE "ct_e_learning_matching_questions" RENAME CONSTRAINT "e_learning_matching_questions_additional_content_id_fkey" TO "ct_e_learning_matching_questions_additional_content_id_fkey";

-- RenameForeignKey
ALTER TABLE "ct_e_learning_multiple_choice_options" RENAME CONSTRAINT "ELearningMultipleChoiceOption_questionId_fkey" TO "ct_e_learning_multiple_choice_options_questionId_fkey";

-- RenameForeignKey
ALTER TABLE "ct_e_learning_multiple_choice_questions" RENAME CONSTRAINT "ELearningMultipleChoiceQuestion_additionalContentId_fkey" TO "ct_e_learning_multiple_choice_questions_additionalContentI_fkey";

-- RenameForeignKey
ALTER TABLE "ct_e_learning_paragraph_contents" RENAME CONSTRAINT "ELearningParagraphContent_contentId_fkey" TO "ct_e_learning_paragraph_contents_contentId_fkey";

-- RenameForeignKey
ALTER TABLE "ct_e_learning_questions" RENAME CONSTRAINT "e_learning_questions_quiz_id_fkey" TO "ct_e_learning_questions_quiz_id_fkey";

-- RenameForeignKey
ALTER TABLE "ct_e_learning_quizzes" RENAME CONSTRAINT "e_learning_quizzes_text_id_fkey" TO "ct_e_learning_quizzes_text_id_fkey";

-- RenameForeignKey
ALTER TABLE "ct_e_learning_summary_comments" RENAME CONSTRAINT "ELearningSummaryComment_summaryId_fkey" TO "ct_e_learning_summary_comments_summaryId_fkey";

-- RenameForeignKey
ALTER TABLE "ct_e_learning_summary_contents" RENAME CONSTRAINT "ELearningSummaryContent_contentId_fkey" TO "ct_e_learning_summary_contents_contentId_fkey";

-- RenameForeignKey
ALTER TABLE "ct_e_learning_tab_items" RENAME CONSTRAINT "ELearningTabItem_tabId_fkey" TO "ct_e_learning_tab_items_tabId_fkey";

-- RenameForeignKey
ALTER TABLE "ct_e_learning_tab_navigation_contents" RENAME CONSTRAINT "ELearningTabNavigationContent_contentId_fkey" TO "ct_e_learning_tab_navigation_contents_contentId_fkey";

-- RenameIndex
ALTER INDEX "article_divider_contents_contentId_key" RENAME TO "ct_article_divider_contents_contentId_key";

-- RenameIndex
ALTER INDEX "ArticleHeadingContent_contentId_key" RENAME TO "ct_article_heading_contents_contentId_key";

-- RenameIndex
ALTER INDEX "ArticleHighlightContent_contentId_key" RENAME TO "ct_article_highlight_contents_contentId_key";

-- RenameIndex
ALTER INDEX "article_image_video_contents_additionalContentId_key" RENAME TO "ct_article_image_video_contents_additionalContentId_key";

-- RenameIndex
ALTER INDEX "article_link_contents_contentId_key" RENAME TO "ct_article_link_contents_contentId_key";

-- RenameIndex
ALTER INDEX "ArticleParagraphContent_contentId_key" RENAME TO "ct_article_paragraph_contents_contentId_key";

-- RenameIndex
ALTER INDEX "article_table_cells_row_id_column_id_key" RENAME TO "ct_article_table_cells_row_id_column_id_key";

-- RenameIndex
ALTER INDEX "article_table_columns_table_id_order_number_key" RENAME TO "ct_article_table_columns_table_id_order_number_key";

-- RenameIndex
ALTER INDEX "article_table_contents_contentId_key" RENAME TO "ct_article_table_contents_contentId_key";

-- RenameIndex
ALTER INDEX "article_table_of_content_contents_article_id_key" RENAME TO "ct_article_table_of_content_contents_article_id_key";

-- RenameIndex
ALTER INDEX "article_table_of_content_contents_contentId_key" RENAME TO "ct_article_table_of_content_contents_contentId_key";

-- RenameIndex
ALTER INDEX "article_table_of_content_items_toc_id_order_number_key" RENAME TO "ct_article_table_of_content_items_toc_id_order_number_key";

-- RenameIndex
ALTER INDEX "article_table_rows_table_id_order_number_key" RENAME TO "ct_article_table_rows_table_id_order_number_key";

-- RenameIndex
ALTER INDEX "ELearningAccordionContent_contentId_key" RENAME TO "ct_e_learning_accordion_contents_contentId_key";

-- RenameIndex
ALTER INDEX "e_learning_assignment_instructions_assignment_id_orderNumbe_key" RENAME TO "ct_e_learning_assignment_instructions_assignment_id_orderNu_key";

-- RenameIndex
ALTER INDEX "e_learning_assignments_text_id_key" RENAME TO "ct_e_learning_assignments_text_id_key";

-- RenameIndex
ALTER INDEX "ELearningCarouselContent_contentId_key" RENAME TO "ct_e_learning_carousel_contents_contentId_key";

-- RenameIndex
ALTER INDEX "ELearningContentCardContent_contentId_key" RENAME TO "ct_e_learning_content_card_contents_contentId_key";

-- RenameIndex
ALTER INDEX "e_learning_executable_codes_additional_content_id_key" RENAME TO "ct_e_learning_executable_codes_additional_content_id_key";

-- RenameIndex
ALTER INDEX "ELearningHeadingContent_contentId_key" RENAME TO "ct_e_learning_heading_contents_contentId_key";

-- RenameIndex
ALTER INDEX "ELearningHighlightContent_contentId_key" RENAME TO "ct_e_learning_highlight_contents_contentId_key";

-- RenameIndex
ALTER INDEX "e_learning_image_video_contents_additionalContentId_key" RENAME TO "ct_e_learning_image_video_contents_additionalContentId_key";

-- RenameIndex
ALTER INDEX "e_learning_matching_questions_additional_content_id_key" RENAME TO "ct_e_learning_matching_questions_additional_content_id_key";

-- RenameIndex
ALTER INDEX "ELearningMultipleChoiceQuestion_additionalContentId_key" RENAME TO "ct_e_learning_multiple_choice_questions_additionalContentId_key";

-- RenameIndex
ALTER INDEX "ELearningParagraphContent_contentId_key" RENAME TO "ct_e_learning_paragraph_contents_contentId_key";

-- RenameIndex
ALTER INDEX "e_learning_quizzes_text_id_key" RENAME TO "ct_e_learning_quizzes_text_id_key";

-- RenameIndex
ALTER INDEX "ELearningSummaryContent_contentId_key" RENAME TO "ct_e_learning_summary_contents_contentId_key";

-- RenameIndex
ALTER INDEX "ELearningTabNavigationContent_contentId_key" RENAME TO "ct_e_learning_tab_navigation_contents_contentId_key";
