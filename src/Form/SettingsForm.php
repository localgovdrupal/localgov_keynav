<?php

declare(strict_types=1);

namespace Drupal\localgov_keynav\Form;

use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Render\Element;

class SettingsForm extends ConfigFormBase {

  protected $entityTypeManager;

  public function __construct(ConfigFactoryInterface $config_factory, EntityTypeManagerInterface $entity_type_manager) {
    parent::__construct($config_factory);
    $this->entityTypeManager = $entity_type_manager;
  }

  public static function create(ContainerInterface $container) {
    return new static(
      $container->get('config.factory'),
      $container->get('entity_type.manager')
    );
  }

  public function getFormId(): string {
    return 'localgov_keynav_settings';
  }

  protected function getEditableConfigNames(): array {
    return ['localgov_keynav.settings'];
  }

  public function buildForm(array $form, FormStateInterface $form_state): array {
    // Add text field for workspace ID.
    $form['custom_keynav_patterns'] = [
      '#type' => 'textarea',
      '#title' => $this->t('Custom KeyNav patterns'),
      '#default_value' => $this->config('localgov_keynav.settings')->get('custom_keynav_patterns'),
      '#description' => $this->t(
        'Add custom KeyNav patterns here, as key|value pairs, one per line.<br>
        These will be added to the default patterns.<br>
        Do not include the lgd part.<br>
        For example, if you want:<br>
          <ul>
            <li><strong>lgdnews</strong> to go to <strong>/news</strong>, add <strong>lgdnews|news</strong></li>
            <li><strong>lgdacu</strong> to go to <strong>/about/contact-us</strong>, add <strong>lgdacu|about/contact-us</strong></li>
          </ul>
        Any items you add here will override the default patterns if the default pattern is also present.
      '),
    ];

    // Attach the configuration to drupalSettings.
    $form['#attached']['drupalSettings']['localgovKeyNav'] = [
      'customKeynavPatterns' => $this->config('localgov_keynav.settings')->get('custom_keynav_patterns'),
    ];

    return parent::buildForm($form, $form_state);
  }

  public function submitForm(array &$form, FormStateInterface $form_state): void {
    $this->config('localgov_keynav.settings')
      ->set('custom_keynav_patterns', $form_state->getValue('custom_keynav_patterns'))
      ->save();
    parent::submitForm($form, $form_state);
  }

}
